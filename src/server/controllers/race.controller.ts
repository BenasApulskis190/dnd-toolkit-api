import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getRaces(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { source, size } = req.query;

		if (q) {
			const filters: Record<string, unknown> = {};
			if (source) filters["source.keyword"] = source as string;
			if (size) filters["size.keyword"] = size as string;

			const result = await search(INDICES.races, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (source) where.source = source as string;
		if (size) where.size = size as string;

		const [races, total] = await Promise.all([
			prisma.race.findMany({
				where,
				skip: from,
				take: limit,
				orderBy: { name: "asc" },
				include: { subraces: { orderBy: { name: "asc" } } },
			}),
			prisma.race.count({ where }),
		]);

		return res.json(paginatedResponse(races, total, pagination));
	} catch (error) {
		console.error("Failed to fetch races:", error);
		return res.status(500).json({ error: "Failed to fetch races" });
	}
}

export async function getRaceById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const race = await prisma.race.findUnique({
			where: { id },
			include: {
				subraces: { orderBy: { name: "asc" } },
				raceLanguages: { include: { language: true } },
			},
		});

		if (!race) {
			return res.status(404).json({ error: `Race not found with id ${id}` });
		}

		const { raceLanguages, ...rest } = race;
		return res.json({ ...rest, languages: raceLanguages.map((rl) => rl.language.name) });
	} catch (error) {
		console.error("Failed to fetch race by id:", error);
		return res.status(500).json({ error: "Failed to fetch race" });
	}
}
