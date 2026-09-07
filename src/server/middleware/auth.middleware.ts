import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../../lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthedRequest<P = Record<string, string>, ResBody = any, ReqBody = any, ReqQuery = any>
	extends Request<P, ResBody, ReqBody, ReqQuery> {
	userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
	const header = req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Missing or invalid Authorization header" });
	}

	const token = header.slice("Bearer ".length);
	try {
		const payload = verifyAccessToken(token);
		req.userId = payload.sub;
		return next();
	} catch {
		return res.status(401).json({ error: "Invalid or expired access token" });
	}
}
