import crypto from "crypto";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { Response } from "express";

const privateKey = fs.readFileSync(path.join(__dirname, "../../keys/jwt-private.pem"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "../../keys/jwt-public.pem"), "utf8");

// Session lifetimes are env-tunable so dev, staging and prod can differ without
// a code change. ACCESS_TOKEN_TTL is a jsonwebtoken duration string ("15m",
// "1h"); SESSION_TTL_DAYS is how long a login survives in total — the refresh
// token's lifetime, and therefore how long the user stays signed in without
// re-entering credentials.
// Cast: jsonwebtoken types the duration as a template-literal union that a
// plain env string can't satisfy.
const ACCESS_TOKEN_TTL = (process.env.ACCESS_TOKEN_TTL || "15m") as jwt.SignOptions["expiresIn"];
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 3;
const REFRESH_TOKEN_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_COOKIE = "refresh_token";

export interface AccessTokenPayload {
	sub: string;
}

export function signAccessToken(userId: string): string {
	return jwt.sign({ sub: userId }, privateKey, {
		algorithm: "RS256",
		expiresIn: ACCESS_TOKEN_TTL,
	});
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	return jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as AccessTokenPayload;
}

export function hashRefreshToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
	const token = crypto.randomBytes(48).toString("hex");
	return {
		token,
		hash: hashRefreshToken(token),
		expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
	};
}

export function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
	res.cookie(REFRESH_TOKEN_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/api/auth",
		expires: expiresAt,
	});
}

export function clearRefreshCookie(res: Response) {
	res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth" });
}
