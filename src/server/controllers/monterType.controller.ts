import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export async function getMonsterTypes(req: Request, res: Response) {
	try {
		const monsterTypes = await prisma.monsterType.findMany({
			orderBy: { name: "asc" },
		});

		return res.json(monsterTypes);
	} catch (error) {
		console.error("Error fetching monster types:", error);

		return res.status(500).json({ error: "Failed to fetch monster types" });
	}
}

export async function getMonsterTypeById(
	req: Request<{ id: string }>,
	res: Response,
) {
	try {
		const { id } = req.params;

		const monsterType = await prisma.monsterType.findUnique({
			where: { id },
			include: { monsters: true },
		});

		if (!monsterType) {
			return res.status(404).json({ error: "Monster type not found" });
		}

    res.json(monsterType);
	} catch (error) {
		console.error("Error fetching monster type:", error);

		res.status(500).json({ error: "Failed to fetch monster type" });
	}
}
