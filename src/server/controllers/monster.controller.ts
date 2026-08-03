import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { searchMonsters } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getMonsters(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { crMin, crMax, type, sortBy, sortOrder } = req.query;

		const SORTABLE_FIELDS = new Set([
			"name", "crValue", "hitPointsAvg", "armorClass", "size",
			"strScore", "dexScore", "conScore", "intScore", "wisScore", "chaScore",
		]);
		const NULLABLE_SORT_FIELDS = new Set([
			"crValue", "hitPointsAvg", "armorClass",
			"strScore", "dexScore", "conScore", "intScore", "wisScore", "chaScore",
		]);
		const sortField = SORTABLE_FIELDS.has(sortBy as string) ? (sortBy as string) : "name";
		const sortDir = sortOrder === "desc" ? "desc" : "asc";
		const nulls = (sortDir === "asc" ? "first" : "last") as "first" | "last";
		const orderBy = NULLABLE_SORT_FIELDS.has(sortField)
			? { [sortField]: { sort: sortDir, nulls } }
			: { [sortField]: sortDir };

		if (q) {
			const result = await searchMonsters(q, {
				size: limit,
				from,
				type: type as string | undefined,
				crMin: crMin ? parseFloat(crMin as string) : undefined,
				crMax: crMax ? parseFloat(crMax as string) : undefined,
			});
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where = type
			? { monsterType: { name: type as string } }
			: undefined;

		const [monsters, total] = await Promise.all([
			prisma.monster.findMany({
				skip: from,
				take: limit,
				orderBy,
				include: { monsterType: true },
				where,
			}),
			prisma.monster.count({ where }),
		]);

		return res.json(paginatedResponse(monsters, total, pagination));
	} catch (error) {
		console.error("Error fetching monsters:", error);
		return res.status(500).json({ error: "Failed to fetch monsters" });
	}
}

export async function getMonsterById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		const monster = await prisma.monster.findUnique({
			where: { id },
			include: {
				monsterType: true,
				traits: true,
				actions: true,
				spells: {
					select: { spell: { select: { id: true, name: true, level: true } } },
				},
			},
		});

		if (!monster) {
			return res.status(404).json({ error: "Monster not found" });
		}

		return res.json({ ...monster, spells: monster.spells.map((ms) => ms.spell) });
	} catch (error) {
		console.error("Error fetching monster:", error);
		return res.status(500).json({ error: "Failed to fetch monster" });
	}
}

export async function getMonsterStats(_req: Request, res: Response) {
	try {
		const [typeStats, crDistribution] = await Promise.all([
			prisma.monsterType.findMany({
				include: { _count: { select: { monsters: true } } },
				orderBy: { name: "asc" },
			}),
			prisma.monster.groupBy({
				by: ["challengeRating"],
				_count: { id: true },
				orderBy: { challengeRating: "asc" },
			}),
		]);

		return res.json({
			byType: typeStats.map((s) => ({
				type: s.name,
				count: s._count.monsters,
			})),
			byCR: crDistribution.map((c) => ({
				cr: c.challengeRating,
				count: c._count.id,
			})),
		});
	} catch (error) {
		console.error("Error fetching monster stats:", error);
		return res.status(500).json({ error: "Failed to fetch monster stats" });
	}
}
