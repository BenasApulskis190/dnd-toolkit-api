import { Response } from "express";
import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";
import { AuthedRequest } from "../middleware/auth.middleware";

const encounterInclude = {
	party: {
		select: {
			id: true,
			name: true,
			characters: {
				select: {
					id: true,
					name: true,
					level: true,
					dexScore: true,
					armorClass: true,
					currentHp: true,
					maxHp: true,
					imageUrl: true,
				},
			},
		},
	},
	monsters: {
		include: {
			monster: {
				select: {
					id: true,
					name: true,
					source: true,
					size: true,
					challengeRating: true,
					crValue: true,
					dexScore: true,
					hitPointsAvg: true,
					armorClass: true,
					monsterType: { select: { name: true } },
				},
			},
		},
		orderBy: { monster: { name: "asc" } },
	},
	loot: {
		include: {
			item: {
				select: {
					id: true,
					name: true,
					source: true,
					type: true,
					rarity: true,
					valueGp: true,
				},
			},
		},
		orderBy: { createdAt: "asc" },
	},
} satisfies Prisma.EncounterInclude;

async function findOwnedParty(userId: string | undefined, partyId: string) {
	return prisma.party.findFirst({ where: { id: partyId, userId } });
}

export async function getEncounters(req: AuthedRequest, res: Response) {
	try {
		const encounters = await prisma.encounter.findMany({
			where: { userId: req.userId },
			include: encounterInclude,
			orderBy: { createdAt: "desc" },
		});

		return res.json({ data: encounters });
	} catch (error) {
		console.error("Failed to fetch encounters:", error);
		return res.status(500).json({ error: "Failed to fetch encounters" });
	}
}

export async function getEncounterById(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const encounter = await prisma.encounter.findFirst({
			where: { id, userId: req.userId },
			include: encounterInclude,
		});

		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		return res.json(encounter);
	} catch (error) {
		console.error("Failed to fetch encounter:", error);
		return res.status(500).json({ error: "Failed to fetch encounter" });
	}
}

export async function createEncounter(req: AuthedRequest, res: Response) {
	try {
		const { name, description, notes, partyId } = req.body;

		if (!name || typeof name !== "string" || !name.trim()) {
			return res.status(400).json({ error: "name is required" });
		}

		if (partyId && !(await findOwnedParty(req.userId, partyId))) {
			return res.status(400).json({ error: "Party not found" });
		}

		const encounter = await prisma.encounter.create({
			data: {
				name: name.trim(),
				description,
				notes,
				partyId: partyId || null,
				userId: req.userId!,
			} as Prisma.EncounterUncheckedCreateInput,
			include: encounterInclude,
		});

		return res.status(201).json(encounter);
	} catch (error) {
		console.error("Failed to create encounter:", error);
		return res.status(500).json({ error: "Failed to create encounter" });
	}
}

export async function updateEncounter(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const existing = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });

		if (!existing) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const { name, description, notes, partyId, isActive } = req.body;

		if (name !== undefined && (typeof name !== "string" || !name.trim())) {
			return res.status(400).json({ error: "name cannot be empty" });
		}

		if (partyId && !(await findOwnedParty(req.userId, partyId))) {
			return res.status(400).json({ error: "Party not found" });
		}

		const encounter = await prisma.encounter.update({
			where: { id },
			data: {
				...(name !== undefined && { name: name.trim() }),
				...(description !== undefined && { description }),
				...(notes !== undefined && { notes }),
				...(partyId !== undefined && { partyId }),
				...(isActive !== undefined && { isActive }),
			} as Prisma.EncounterUncheckedUpdateInput,
			include: encounterInclude,
		});

		return res.json(encounter);
	} catch (error) {
		console.error("Failed to update encounter:", error);
		return res.status(500).json({ error: "Failed to update encounter" });
	}
}

export async function deleteEncounter(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const existing = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });

		if (!existing) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		await prisma.encounter.delete({ where: { id } });

		return res.status(204).send();
	} catch (error) {
		console.error("Failed to delete encounter:", error);
		return res.status(500).json({ error: "Failed to delete encounter" });
	}
}

export async function addMonsterToEncounter(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const { monsterId, quantity } = req.body;

		if (!monsterId || typeof monsterId !== "string") {
			return res.status(400).json({ error: "monsterId is required" });
		}

		const addQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

		const encounter = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });
		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const monster = await prisma.monster.findUnique({ where: { id: monsterId } });
		if (!monster) {
			return res.status(400).json({ error: "Monster not found" });
		}

		const existing = await prisma.encounterMonster.findUnique({
			where: { encounterId_monsterId: { encounterId: id, monsterId } },
		});

		if (existing) {
			await prisma.encounterMonster.update({
				where: { id: existing.id },
				data: { quantity: existing.quantity + addQuantity },
			});
		} else {
			await prisma.encounterMonster.create({
				data: { encounterId: id, monsterId, quantity: addQuantity },
			});
		}

		const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
		return res.status(201).json(updated);
	} catch (error) {
		console.error("Failed to add monster to encounter:", error);
		return res.status(500).json({ error: "Failed to add monster to encounter" });
	}
}

export async function updateEncounterMonster(
	req: AuthedRequest<{ id: string; monsterId: string }>,
	res: Response,
) {
	try {
		const { id, monsterId } = req.params;
		const { quantity } = req.body;

		const encounter = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });
		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const existing = await prisma.encounterMonster.findUnique({
			where: { encounterId_monsterId: { encounterId: id, monsterId } },
		});
		if (!existing) {
			return res.status(404).json({ error: "Monster not found in this encounter" });
		}

		if (!Number.isFinite(quantity)) {
			return res.status(400).json({ error: "quantity must be a number" });
		}

		if (quantity <= 0) {
			await prisma.encounterMonster.delete({ where: { id: existing.id } });
		} else {
			await prisma.encounterMonster.update({
				where: { id: existing.id },
				data: { quantity: Math.floor(quantity) },
			});
		}

		const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
		return res.json(updated);
	} catch (error) {
		console.error("Failed to update encounter monster:", error);
		return res.status(500).json({ error: "Failed to update encounter monster" });
	}
}

export async function removeMonsterFromEncounter(
	req: AuthedRequest<{ id: string; monsterId: string }>,
	res: Response,
) {
	try {
		const { id, monsterId } = req.params;

		const encounter = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });
		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const existing = await prisma.encounterMonster.findUnique({
			where: { encounterId_monsterId: { encounterId: id, monsterId } },
		});
		if (!existing) {
			return res.status(404).json({ error: "Monster not found in this encounter" });
		}

		await prisma.encounterMonster.delete({ where: { id: existing.id } });

		const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
		return res.json(updated);
	} catch (error) {
		console.error("Failed to remove monster from encounter:", error);
		return res.status(500).json({ error: "Failed to remove monster from encounter" });
	}
}

export async function addLootToEncounter(req: AuthedRequest<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const { itemId, customName, quantity, valueGp, notes } = req.body;

		const encounter = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });
		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const hasItemId = typeof itemId === "string" && itemId.trim();
		const hasCustomName = typeof customName === "string" && customName.trim();

		if (!hasItemId && !hasCustomName) {
			return res.status(400).json({ error: "itemId or customName is required" });
		}

		if (hasItemId) {
			const item = await prisma.item.findUnique({ where: { id: itemId } });
			if (!item) {
				return res.status(400).json({ error: "Item not found" });
			}
		}

		if (valueGp !== undefined && valueGp !== null && !Number.isFinite(valueGp)) {
			return res.status(400).json({ error: "valueGp must be a number" });
		}

		const addQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

		// Catalog items merge into their existing row (mirrors addMonsterToEncounter); custom loot
		// always gets its own row since two "Silver necklace" entries may not be the same object.
		const existing = hasItemId
			? await prisma.encounterLoot.findFirst({ where: { encounterId: id, itemId } })
			: null;

		if (existing) {
			await prisma.encounterLoot.update({
				where: { id: existing.id },
				data: { quantity: existing.quantity + addQuantity },
			});
		} else {
			await prisma.encounterLoot.create({
				data: {
					encounterId: id,
					itemId: hasItemId ? itemId : null,
					customName: hasItemId ? null : customName.trim(),
					quantity: addQuantity,
					valueGp: valueGp ?? null,
					notes: notes || null,
				},
			});
		}

		const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
		return res.status(201).json(updated);
	} catch (error) {
		console.error("Failed to add loot to encounter:", error);
		return res.status(500).json({ error: "Failed to add loot to encounter" });
	}
}

export async function updateEncounterLoot(
	req: AuthedRequest<{ id: string; lootId: string }>,
	res: Response,
) {
	try {
		const { id, lootId } = req.params;
		const { quantity, valueGp, notes } = req.body;

		const encounter = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });
		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const existing = await prisma.encounterLoot.findFirst({ where: { id: lootId, encounterId: id } });
		if (!existing) {
			return res.status(404).json({ error: "Loot entry not found in this encounter" });
		}

		if (quantity !== undefined) {
			if (!Number.isFinite(quantity)) {
				return res.status(400).json({ error: "quantity must be a number" });
			}

			if (quantity <= 0) {
				await prisma.encounterLoot.delete({ where: { id: lootId } });
				const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
				return res.json(updated);
			}
		}

		if (valueGp !== undefined && valueGp !== null && !Number.isFinite(valueGp)) {
			return res.status(400).json({ error: "valueGp must be a number" });
		}

		await prisma.encounterLoot.update({
			where: { id: lootId },
			data: {
				...(quantity !== undefined && { quantity: Math.floor(quantity) }),
				...(valueGp !== undefined && { valueGp }),
				...(notes !== undefined && { notes: notes || null }),
			},
		});

		const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
		return res.json(updated);
	} catch (error) {
		console.error("Failed to update encounter loot:", error);
		return res.status(500).json({ error: "Failed to update encounter loot" });
	}
}

export async function removeLootFromEncounter(
	req: AuthedRequest<{ id: string; lootId: string }>,
	res: Response,
) {
	try {
		const { id, lootId } = req.params;

		const encounter = await prisma.encounter.findFirst({ where: { id, userId: req.userId } });
		if (!encounter) {
			return res.status(404).json({ error: `Encounter not found with id ${id}` });
		}

		const existing = await prisma.encounterLoot.findFirst({ where: { id: lootId, encounterId: id } });
		if (!existing) {
			return res.status(404).json({ error: "Loot entry not found in this encounter" });
		}

		await prisma.encounterLoot.delete({ where: { id: lootId } });

		const updated = await prisma.encounter.findUnique({ where: { id }, include: encounterInclude });
		return res.json(updated);
	} catch (error) {
		console.error("Failed to remove encounter loot:", error);
		return res.status(500).json({ error: "Failed to remove encounter loot" });
	}
}
