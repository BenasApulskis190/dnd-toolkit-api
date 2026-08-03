import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getConditions(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { source } = req.query;

		if (q) {
			const filters: Record<string, string> = {};
			if (source) filters["source.keyword"] = source as string;

			const result = await search(INDICES.conditions, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (source) where.source = source as string;

		const [conditions, total] = await Promise.all([
			prisma.condition.findMany({ where, skip: from, take: limit, orderBy: { name: "asc" } }),
			prisma.condition.count({ where }),
		]);

		return res.json(paginatedResponse(conditions, total, pagination));
	} catch (error) {
		console.error("Failed to fetch conditions:", error);
		return res.status(500).json({ error: "Failed to fetch conditions" });
	}
}

export async function getConditionById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const condition = await prisma.condition.findUnique({ where: { id } });

		if (!condition) {
			return res.status(404).json({ error: `Condition not found with id ${id}` });
		}

		return res.json(condition);
	} catch (error) {
		console.error("Failed to fetch condition by id:", error);
		return res.status(500).json({ error: "Failed to fetch condition" });
	}
}
