import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

// Adventures are looked up by UUID or by code (e.g. "LMoP"), case-insensitive
function adventureWhere(idOrCode: string) {
	const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
	return isUuid
		? { id: idOrCode }
		: { code: { equals: idOrCode, mode: "insensitive" as const } };
}

export async function getAdventures(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { storyline } = req.query;

		const where: Record<string, unknown> = {};
		if (q) where.name = { contains: q, mode: "insensitive" };
		if (storyline) where.storyline = { equals: storyline as string, mode: "insensitive" };

		const [adventures, total] = await Promise.all([
			prisma.adventure.findMany({
				where,
				skip: from,
				take: limit,
				orderBy: { published: "asc" },
				include: {
					book: { select: { id: true, code: true, name: true } },
					_count: { select: { sections: true, npcs: true } },
				},
			}),
			prisma.adventure.count({ where }),
		]);

		return res.json(paginatedResponse(adventures, total, pagination));
	} catch (error) {
		console.error("Failed to fetch adventures:", error);
		return res.status(500).json({ error: "Failed to fetch adventures" });
	}
}

export async function getAdventureById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		const adventure = await prisma.adventure.findFirst({
			where: adventureWhere(id),
			include: {
				book: { select: { id: true, code: true, name: true } },
				sections: {
					orderBy: { ordinal: "asc" },
					select: { id: true, ordinal: true, name: true, headers: true, images: true },
				},
				npcs: {
					orderBy: { name: "asc" },
					select: { id: true, name: true, source: true, tokenUrl: true, monsterId: true },
				},
			},
		});

		if (!adventure) {
			return res.status(404).json({ error: `Adventure not found with id or code ${id}` });
		}

		return res.json(adventure);
	} catch (error) {
		console.error("Failed to fetch adventure by id:", error);
		return res.status(500).json({ error: "Failed to fetch adventure" });
	}
}

export async function getAdventureSection(
	req: Request<{ id: string; ordinal: string }>,
	res: Response,
) {
	try {
		const { id } = req.params;
		const ordinal = parseInt(req.params.ordinal, 10);

		if (isNaN(ordinal) || ordinal < 0) {
			return res.status(400).json({ error: "Section ordinal must be a non-negative number" });
		}

		const adventure = await prisma.adventure.findFirst({
			where: adventureWhere(id),
			select: { id: true, code: true, name: true },
		});

		if (!adventure) {
			return res.status(404).json({ error: `Adventure not found with id or code ${id}` });
		}

		const section = await prisma.adventureSection.findUnique({
			where: { adventureId_ordinal: { adventureId: adventure.id, ordinal } },
		});

		if (!section) {
			return res
				.status(404)
				.json({ error: `Section ${ordinal} not found for adventure ${adventure.code}` });
		}

		return res.json({ ...section, adventure });
	} catch (error) {
		console.error("Failed to fetch adventure section:", error);
		return res.status(500).json({ error: "Failed to fetch adventure section" });
	}
}
