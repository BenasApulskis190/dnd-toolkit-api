import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getSpells(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { level, school, source, concentration, ritual, damageType } = req.query;

		if (q) {
			const filters: Record<string, unknown> = {};
			if (level) filters["level"] = parseInt(level as string);
			if (school) filters["school.keyword"] = school as string;
			if (source) filters["source.keyword"] = source as string;
			if (damageType) filters["damageType.keyword"] = damageType as string;
			if (concentration !== undefined) filters["concentration"] = concentration === "true";
			if (ritual !== undefined) filters["ritual"] = ritual === "true";

			const result = await search(INDICES.spells, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (level) where.level = parseInt(level as string);
		if (school) where.school = school as string;
		if (source) where.source = source as string;
		if (damageType) where.damageType = damageType as string;
		if (concentration !== undefined) where.concentration = concentration === "true";
		if (ritual !== undefined) where.ritual = ritual === "true";

		const [spells, total] = await Promise.all([
			prisma.spell.findMany({
				where,
				skip: from,
				take: limit,
				orderBy: { name: "asc" },
				include: {
					classes: {
						select: {
							classId: true,
							fromSubclass: true,
							subclassId: true,
							class: { select: { name: true, source: true } },
							subclass: { select: { name: true, source: true } },
						},
					},
				},
			}),
			prisma.spell.count({ where }),
		]);

		return res.json(paginatedResponse(spells, total, pagination));
	} catch (error) {
		console.error("Failed to fetch spell list:", error);
		return res.status(500).json({ error: "Failed to fetch spell list" });
	}
}

export async function getSpellById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		const spell = await prisma.spell.findUnique({
			where: { id },
			include: {
				classes: {
					select: {
						classId: true,
						fromSubclass: true,
						subclassId: true,
						class: { select: { name: true, source: true } },
					},
				},
			},
		});

		if (!spell) {
			return res.status(404).json({ error: `Spell not found with id ${id}` });
		}

		return res.json(spell);
	} catch (error) {
		console.error("Failed to fetch spell by id:", error);
		return res.status(500).json({ error: "Failed to fetch spell" });
	}
}
