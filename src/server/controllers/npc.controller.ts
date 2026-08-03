import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getNpcs(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { adventure, source } = req.query;

		const where: Record<string, unknown> = {};
		if (q) where.name = { contains: q, mode: "insensitive" };
		if (source) where.source = { equals: source as string, mode: "insensitive" };
		if (adventure) {
			where.adventure = { code: { equals: adventure as string, mode: "insensitive" } };
		}

		const [npcs, total] = await Promise.all([
			prisma.npc.findMany({
				where,
				skip: from,
				take: limit,
				orderBy: { name: "asc" },
				include: {
					adventure: { select: { id: true, code: true, name: true } },
					monster: {
						select: {
							id: true,
							name: true,
							challengeRating: true,
							monsterType: { select: { name: true } },
						},
					},
				},
			}),
			prisma.npc.count({ where }),
		]);

		return res.json(paginatedResponse(npcs, total, pagination));
	} catch (error) {
		console.error("Failed to fetch NPCs:", error);
		return res.status(500).json({ error: "Failed to fetch NPCs" });
	}
}

export async function getNpcById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		const npc = await prisma.npc.findUnique({
			where: { id },
			include: {
				adventure: { select: { id: true, code: true, name: true } },
				monster: {
					include: {
						monsterType: true,
						traits: true,
						actions: true,
						spells: { include: { spell: { select: { id: true, name: true, level: true } } } },
					},
				},
			},
		});

		if (!npc) {
			return res.status(404).json({ error: `NPC not found with id ${id}` });
		}

		return res.json(npc);
	} catch (error) {
		console.error("Failed to fetch NPC by id:", error);
		return res.status(500).json({ error: "Failed to fetch NPC" });
	}
}
