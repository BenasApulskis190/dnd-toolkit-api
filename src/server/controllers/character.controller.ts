import { Response } from "express";
import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";
import { AuthedRequest } from "../middleware/auth.middleware";

const characterInclude = {
	party: { select: { id: true, name: true } },
	race: { select: { id: true, name: true } },
	subrace: { select: { id: true, name: true } },
	class: { select: { id: true, name: true } },
	subclass: { select: { id: true, name: true } },
	background: { select: { id: true, name: true } },
} satisfies Prisma.CharacterInclude;

const writableFields = [
	"partyId",
	"name",
	"playerName",
	"level",
	"raceId",
	"subraceId",
	"classId",
	"subclassId",
	"backgroundId",
	"armorClass",
	"currentHp",
	"maxHp",
	"tempHp",
	"proficiencyBonus",
	"experiencePoints",
	"strScore",
	"dexScore",
	"conScore",
	"intScore",
	"wisScore",
	"chaScore",
	"passivePerception",
	"passiveInvestigation",
	"passiveInsight",
	"inspiration",
	"imageUrl",
	"notes",
] as const;

function pickWritableFields(body: Record<string, unknown>) {
	const data: Record<string, unknown> = {};
	for (const field of writableFields) {
		if (body[field] !== undefined) {
			data[field] = body[field];
		}
	}
	return data;
}

function isForeignKeyError(error: unknown): boolean {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

export async function getCharacters(
	req: AuthedRequest<Record<string, string>, unknown, unknown, { partyId?: string; unassigned?: string }>,
	res: Response,
) {
	try {
		const { partyId, unassigned } = req.query;

		const where: Prisma.CharacterWhereInput = { userId: req.userId };
		if (unassigned === "true") {
			where.partyId = null;
		} else if (typeof partyId === "string") {
			where.partyId = partyId;
		}

		const characters = await prisma.character.findMany({
			where,
			include: characterInclude,
			orderBy: { name: "asc" },
		});

		return res.json({ data: characters });
	} catch (error) {
		console.error("Failed to fetch characters:", error);
		return res.status(500).json({ error: "Failed to fetch characters" });
	}
}

export async function getCharacterById(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const character = await prisma.character.findFirst({
			where: { id, userId: req.userId },
			include: characterInclude,
		});

		if (!character) {
			return res.status(404).json({ error: `Character not found with id ${id}` });
		}

		return res.json(character);
	} catch (error) {
		console.error("Failed to fetch character:", error);
		return res.status(500).json({ error: "Failed to fetch character" });
	}
}

export async function createCharacter(req: AuthedRequest, res: Response) {
	try {
		const { name } = req.body;

		if (!name || typeof name !== "string" || !name.trim()) {
			return res.status(400).json({ error: "name is required" });
		}

		const data = pickWritableFields(req.body);

		if (data.partyId) {
			const party = await prisma.party.findFirst({
				where: { id: data.partyId as string, userId: req.userId },
			});
			if (!party) {
				return res.status(400).json({ error: "Party not found" });
			}
		}

		const character = await prisma.character.create({
			data: { ...data, name: name.trim(), userId: req.userId! } as Prisma.CharacterUncheckedCreateInput,
			include: characterInclude,
		});

		return res.status(201).json(character);
	} catch (error) {
		if (isForeignKeyError(error)) {
			return res.status(400).json({ error: "One of the referenced ids does not exist" });
		}
		console.error("Failed to create character:", error);
		return res.status(500).json({ error: "Failed to create character" });
	}
}

export async function updateCharacter(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const existing = await prisma.character.findFirst({ where: { id, userId: req.userId } });

		if (!existing) {
			return res.status(404).json({ error: `Character not found with id ${id}` });
		}

		const data = pickWritableFields(req.body);

		if (typeof data.name === "string" && !data.name.trim()) {
			return res.status(400).json({ error: "name cannot be empty" });
		}

		if (data.partyId) {
			const party = await prisma.party.findFirst({
				where: { id: data.partyId as string, userId: req.userId },
			});
			if (!party) {
				return res.status(400).json({ error: "Party not found" });
			}
		}

		const character = await prisma.character.update({
			where: { id },
			data: data as Prisma.CharacterUncheckedUpdateInput,
			include: characterInclude,
		});

		return res.json(character);
	} catch (error) {
		if (isForeignKeyError(error)) {
			return res.status(400).json({ error: "One of the referenced ids does not exist" });
		}
		console.error("Failed to update character:", error);
		return res.status(500).json({ error: "Failed to update character" });
	}
}

export async function deleteCharacter(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const existing = await prisma.character.findFirst({ where: { id, userId: req.userId } });

		if (!existing) {
			return res.status(404).json({ error: `Character not found with id ${id}` });
		}

		await prisma.character.delete({ where: { id } });

		return res.status(204).send();
	} catch (error) {
		console.error("Failed to delete character:", error);
		return res.status(500).json({ error: "Failed to delete character" });
	}
}
