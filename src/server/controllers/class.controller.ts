import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getClasses(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { source, hitDie } = req.query;

		if (q) {
			const filters: Record<string, unknown> = {};
			if (source) filters["source.keyword"] = source as string;
			if (hitDie) filters["hitDie"] = parseInt(hitDie as string);

			const result = await search(INDICES.classes, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (source) where.source = source as string;
		if (hitDie) where.hitDie = parseInt(hitDie as string);

		const [classes, total] = await Promise.all([
			prisma.class.findMany({ where, skip: from, take: limit, orderBy: { name: "asc" } }),
			prisma.class.count({ where }),
		]);

		return res.json(paginatedResponse(classes, total, pagination));
	} catch (error) {
		console.error("Failed to fetch classes:", error);
		return res.status(500).json({ error: "Failed to fetch classes" });
	}
}

export async function getClassById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const dndClass = await prisma.class.findUnique({
			where: { id },
			include: {
				features: { orderBy: { level: "asc" } },
				subclasses: {
					orderBy: { name: "asc" },
					include: { features: { orderBy: { level: "asc" } } },
				},
			},
		});

		if (!dndClass) {
			return res.status(404).json({ error: `Class not found with id ${id}` });
		}

		return res.json(dndClass);
	} catch (error) {
		console.error("Failed to fetch class by id:", error);
		return res.status(500).json({ error: "Failed to fetch class" });
	}
}
