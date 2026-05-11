import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";

export async function getMonsters(req: Request, res: Response) {
	try {
		const q = (req.query.q as string) || "";
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const from = (page - 1) * limit;

		const { crMin, crMax, type, sortBy, sortOrder, ...restQuery } = req.query;
		const filters: Record<string, any> = {};
		if (type) filters.type = type;
		if (crMin) filters.crValue = { $gte: parseFloat(crMin as string) };
		if (crMax)
			filters.crValue = {
				...filters.crValue,
				$lte: parseFloat(crMax as string),
			};
		Object.entries(restQuery).forEach(([key, value]) => {
			if (
				value !== undefined &&
				value !== "" &&
				!["q", "page", "limit"].includes(key)
			) {
				filters[key] = value;
			}
		});

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
			const result = await search(INDICES.monsters, q, {
				size: limit,
				from,
				filters,
			});
			return res.json({
				data: result.hits,
				pagination: {
					page,
					limit,
					total: result.total,
					totalPages: Math.ceil(result.total / limit),
				},
			});
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

		return res.json({
			data: monsters,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching monsters:", error);
		res.status(500).json({ error: "Failed to fetch monsters" });
	}
}

export async function getMonsterById(
	req: Request<{ id: string }>,
	res: Response,
) {
	try {
		const { id } = req.params;

		const monster = await prisma.monster.findUnique({
			where: { id },
			include: {
				monsterType: true,
				traits: true,
				actions: true,
			},
		});

		if (!monster) {
			return res.status(404).json({ error: "Monster not found" });
		}

		res.json(monster);
	} catch (error) {
		console.error("Error fetching monster:", error);
		res.status(500).json({ error: "Failed to fetch monster" });
	}
}

export async function getMonsterStats(req: Request, res: Response) {
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

		res.json({
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
		res.status(500).json({ error: "Failed to fetch monster stats" });
	}
}
