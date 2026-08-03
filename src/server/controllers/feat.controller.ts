import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getFeats(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { source } = req.query;

		if (q) {
			const filters: Record<string, string> = {};
			if (source) filters["source.keyword"] = source as string;

			const result = await search(INDICES.feats, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (source) where.source = source as string;

		const [feats, total] = await Promise.all([
			prisma.feat.findMany({ where, skip: from, take: limit, orderBy: { name: "asc" } }),
			prisma.feat.count({ where }),
		]);

		return res.json(paginatedResponse(feats, total, pagination));
	} catch (error) {
		console.error("Failed to fetch feats:", error);
		return res.status(500).json({ error: "Failed to fetch feats" });
	}
}

export async function getFeatById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const feat = await prisma.feat.findUnique({ where: { id } });

		if (!feat) {
			return res.status(404).json({ error: `Feat not found with id ${id}` });
		}

		return res.json(feat);
	} catch (error) {
		console.error("Failed to fetch feat by id:", error);
		return res.status(500).json({ error: "Failed to fetch feat" });
	}
}
