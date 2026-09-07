import { Response } from "express";
import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";
import { AuthedRequest } from "../middleware/auth.middleware";

const partyInclude = {
	characters: {
		orderBy: { name: "asc" },
		include: {
			race: { select: { id: true, name: true } },
			class: { select: { id: true, name: true } },
		},
	},
} satisfies Prisma.PartyInclude;

export async function getParties(req: AuthedRequest, res: Response) {
	try {
		const parties = await prisma.party.findMany({
			where: { userId: req.userId },
			include: partyInclude,
			orderBy: { name: "asc" },
		});

		return res.json({ data: parties });
	} catch (error) {
		console.error("Failed to fetch parties:", error);
		return res.status(500).json({ error: "Failed to fetch parties" });
	}
}

export async function getPartyById(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const party = await prisma.party.findFirst({
			where: { id, userId: req.userId },
			include: partyInclude,
		});

		if (!party) {
			return res.status(404).json({ error: `Party not found with id ${id}` });
		}

		return res.json(party);
	} catch (error) {
		console.error("Failed to fetch party:", error);
		return res.status(500).json({ error: "Failed to fetch party" });
	}
}

export async function createParty(req: AuthedRequest, res: Response) {
	try {
		const { name, description, imageUrl } = req.body;

		if (!name || typeof name !== "string" || !name.trim()) {
			return res.status(400).json({ error: "name is required" });
		}

		const party = await prisma.party.create({
			data: { name: name.trim(), description, imageUrl, userId: req.userId! },
			include: partyInclude,
		});

		return res.status(201).json(party);
	} catch (error) {
		console.error("Failed to create party:", error);
		return res.status(500).json({ error: "Failed to create party" });
	}
}

export async function updateParty(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const existing = await prisma.party.findFirst({ where: { id, userId: req.userId } });

		if (!existing) {
			return res.status(404).json({ error: `Party not found with id ${id}` });
		}

		const { name, description, imageUrl } = req.body;

		if (name !== undefined && (typeof name !== "string" || !name.trim())) {
			return res.status(400).json({ error: "name cannot be empty" });
		}

		const party = await prisma.party.update({
			where: { id },
			data: {
				...(name !== undefined && { name: name.trim() }),
				...(description !== undefined && { description }),
				...(imageUrl !== undefined && { imageUrl }),
			},
			include: partyInclude,
		});

		return res.json(party);
	} catch (error) {
		console.error("Failed to update party:", error);
		return res.status(500).json({ error: "Failed to update party" });
	}
}

export async function deleteParty(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const existing = await prisma.party.findFirst({ where: { id, userId: req.userId } });

		if (!existing) {
			return res.status(404).json({ error: `Party not found with id ${id}` });
		}

		await prisma.party.delete({ where: { id } });

		return res.status(204).send();
	} catch (error) {
		console.error("Failed to delete party:", error);
		return res.status(500).json({ error: "Failed to delete party" });
	}
}

export async function addCharacterToParty(
	req: AuthedRequest<{ id: string; characterId: string }>,
	res: Response,
) {
	try {
		const { id, characterId } = req.params;

		const party = await prisma.party.findFirst({ where: { id, userId: req.userId } });
		if (!party) {
			return res.status(404).json({ error: `Party not found with id ${id}` });
		}

		const character = await prisma.character.findFirst({
			where: { id: characterId, userId: req.userId },
		});
		if (!character) {
			return res.status(404).json({ error: `Character not found with id ${characterId}` });
		}

		await prisma.character.update({ where: { id: characterId }, data: { partyId: id } });

		const updated = await prisma.party.findUnique({ where: { id }, include: partyInclude });
		return res.json(updated);
	} catch (error) {
		console.error("Failed to add character to party:", error);
		return res.status(500).json({ error: "Failed to add character to party" });
	}
}

export async function removeCharacterFromParty(
	req: AuthedRequest<{ id: string; characterId: string }>,
	res: Response,
) {
	try {
		const { id, characterId } = req.params;

		const character = await prisma.character.findFirst({
			where: { id: characterId, userId: req.userId, partyId: id },
		});
		if (!character) {
			return res.status(404).json({ error: `Character not found in this party` });
		}

		await prisma.character.update({ where: { id: characterId }, data: { partyId: null } });

		const updated = await prisma.party.findUnique({ where: { id }, include: partyInclude });
		return res.json(updated);
	} catch (error) {
		console.error("Failed to remove character from party:", error);
		return res.status(500).json({ error: "Failed to remove character from party" });
	}
}
