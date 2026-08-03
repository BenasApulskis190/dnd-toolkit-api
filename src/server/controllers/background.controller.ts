import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getBackgrounds(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { source } = req.query;

		if (q) {
			const filters: Record<string, string> = {};
			if (source) filters["source.keyword"] = source as string;

			const result = await search(INDICES.backgrounds, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (source) where.source = source as string;

		const [backgrounds, total] = await Promise.all([
			prisma.background.findMany({ where, skip: from, take: limit, orderBy: { name: "asc" } }),
			prisma.background.count({ where }),
		]);

		return res.json(paginatedResponse(backgrounds, total, pagination));
	} catch (error) {
		console.error("Failed to fetch backgrounds:", error);
		return res.status(500).json({ error: "Failed to fetch backgrounds" });
	}
}

export async function getBackgroundById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const background = await prisma.background.findUnique({
			where: { id },
			include: { backgroundLanguages: { include: { language: true } } },
		});

		if (!background) {
			return res.status(404).json({ error: `Background not found with id ${id}` });
		}

		return res.json(background);
	} catch (error) {
		console.error("Failed to fetch background by id:", error);
		return res.status(500).json({ error: "Failed to fetch background" });
	}
}
