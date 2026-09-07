import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../lib/prisma";
import {
	REFRESH_TOKEN_COOKIE,
	clearRefreshCookie,
	generateRefreshToken,
	hashRefreshToken,
	setRefreshCookie,
	signAccessToken,
} from "../../lib/auth";
import { AuthedRequest } from "../middleware/auth.middleware";

const PASSWORD_MIN_LENGTH = 8;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userSelect = {
	id: true,
	username: true,
	email: true,
	name: true,
	avatarUrl: true,
	createdAt: true,
};

async function generateUniqueUsername(base: string): Promise<string> {
	const cleaned = base.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user";
	let candidate = cleaned;
	let suffix = 0;
	while (await prisma.user.findUnique({ where: { username: candidate } })) {
		suffix += 1;
		candidate = `${cleaned}${suffix}`;
	}
	return candidate;
}

async function issueTokens(res: Response, userId: string, status: number) {
	const accessToken = signAccessToken(userId);
	const { token: refreshToken, hash, expiresAt } = generateRefreshToken();

	// Opportunistic cleanup: drop this user's stale sessions so the table
	// doesn't grow unbounded, without needing a separate scheduled job.
	await prisma.refreshToken.deleteMany({
		where: {
			userId,
			OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
		},
	});
	await prisma.refreshToken.create({ data: { userId, tokenHash: hash, expiresAt } });
	setRefreshCookie(res, refreshToken, expiresAt);

	const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });

	return res.status(status).json({ accessToken, user });
}

export async function register(req: Request, res: Response) {
	try {
		const { username, email, password } = req.body;

		if (!username || !email || !password) {
			return res.status(400).json({ error: "username, email, and password are required" });
		}
		if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
			return res
				.status(400)
				.json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
		}

		const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
		if (existing) {
			return res.status(409).json({ error: "Username or email already in use" });
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({ data: { username, email, passwordHash } });

		return issueTokens(res, user.id, 201);
	} catch (error) {
		console.error("Registration failed:", error);
		return res.status(500).json({ error: "Registration failed" });
	}
}

export async function login(req: Request, res: Response) {
	try {
		const { identifier, password } = req.body;

		if (!identifier || !password) {
			return res.status(400).json({ error: "identifier and password are required" });
		}

		const user = await prisma.user.findFirst({
			where: { OR: [{ email: identifier }, { username: identifier }] },
		});

		if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		return issueTokens(res, user.id, 200);
	} catch (error) {
		console.error("Login failed:", error);
		return res.status(500).json({ error: "Login failed" });
	}
}

export async function googleLogin(req: Request, res: Response) {
	try {
		const { idToken } = req.body;
		if (!idToken) {
			return res.status(400).json({ error: "idToken is required" });
		}

		let payload;
		try {
			const ticket = await googleClient.verifyIdToken({
				idToken,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			payload = ticket.getPayload();
		} catch {
			return res.status(401).json({ error: "Invalid Google ID token" });
		}

		if (!payload?.sub || !payload.email) {
			return res.status(401).json({ error: "Invalid Google ID token" });
		}

		let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });

		if (!user) {
			const existingByEmail = await prisma.user.findUnique({ where: { email: payload.email } });

			if (existingByEmail) {
				user = await prisma.user.update({
					where: { id: existingByEmail.id },
					data: {
						googleId: payload.sub,
						name: existingByEmail.name ?? payload.name,
						avatarUrl: existingByEmail.avatarUrl ?? payload.picture,
					},
				});
			} else {
				const username = await generateUniqueUsername(payload.email.split("@")[0]);
				user = await prisma.user.create({
					data: {
						googleId: payload.sub,
						email: payload.email,
						username,
						name: payload.name,
						avatarUrl: payload.picture,
					},
				});
			}
		}

		return issueTokens(res, user.id, 200);
	} catch (error) {
		console.error("Google login failed:", error);
		return res.status(500).json({ error: "Google login failed" });
	}
}

export async function refresh(req: Request, res: Response) {
	try {
		const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
		if (!token) {
			return res.status(401).json({ error: "Missing refresh token" });
		}

		const tokenHash = hashRefreshToken(token);
		const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

		if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
			clearRefreshCookie(res);
			return res.status(401).json({ error: "Invalid or expired refresh token" });
		}

		await prisma.refreshToken.update({
			where: { id: stored.id },
			data: { revokedAt: new Date() },
		});

		return issueTokens(res, stored.userId, 200);
	} catch (error) {
		console.error("Refresh failed:", error);
		return res.status(500).json({ error: "Refresh failed" });
	}
}

export async function logout(req: Request, res: Response) {
	try {
		const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
		if (token) {
			const tokenHash = hashRefreshToken(token);
			await prisma.refreshToken.updateMany({
				where: { tokenHash, revokedAt: null },
				data: { revokedAt: new Date() },
			});
		}

		clearRefreshCookie(res);
		return res.status(204).send();
	} catch (error) {
		console.error("Logout failed:", error);
		return res.status(500).json({ error: "Logout failed" });
	}
}

export async function me(req: AuthedRequest, res: Response) {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.userId }, select: userSelect });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		return res.json(user);
	} catch (error) {
		console.error("Failed to fetch current user:", error);
		return res.status(500).json({ error: "Failed to fetch current user" });
	}
}
