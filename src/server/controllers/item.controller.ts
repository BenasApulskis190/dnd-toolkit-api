import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { search, INDICES } from "../../lib/elasticsearch";
import { parsePagination, paginatedResponse } from "../../lib/pagination";

export async function getItems(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const {
			type,
			subtype,
			rarity,
			attunement,
			source,
			armorType,
			weaponType,
			weaponCategory,
			magic,
			valueMin,
			valueMax,
		} = req.query;

		// An item can belong to several categories (a Flame Tongue is both
		// "weapon" and "magic item"), so type filtering matches the types array
		const typeFilters: string[] = [];
		if (type) typeFilters.push((type as string).toLowerCase());
		if (magic === "true" || magic === "1") typeFilters.push("magic item");

		if (q) {
			const filters: Record<string, unknown> = {};
			if (typeFilters.length > 0) filters["types.keyword"] = typeFilters;
			if (subtype) filters["subtype.keyword"] = subtype as string;
			if (rarity) filters["rarity.keyword"] = rarity as string;
			if (source) filters["source.keyword"] = source as string;
			if (armorType) filters["armorType.keyword"] = (armorType as string).toLowerCase();
			if (weaponType) filters["weaponType.keyword"] = (weaponType as string).toLowerCase();
			if (weaponCategory) filters["weaponCategory.keyword"] = (weaponCategory as string).toLowerCase();
			if (attunement !== undefined) filters["attunement"] = attunement === "true";

			const result = await search(INDICES.items, q, { size: limit, from, filters });
			return res.json(paginatedResponse(result.hits, result.total, pagination));
		}

		const where: Record<string, unknown> = {};
		if (typeFilters.length > 0) where.types = { hasEvery: typeFilters };
		if (magic === "false" || magic === "0") where.NOT = { types: { has: "magic item" } };
		if (subtype) where.subtype = subtype as string;
		if (rarity) where.rarity = { equals: rarity as string, mode: "insensitive" };
		if (source) where.source = source as string;
		if (armorType) where.armorType = { equals: armorType as string, mode: "insensitive" };
		if (weaponType) where.weaponType = { equals: weaponType as string, mode: "insensitive" };
		if (weaponCategory)
			where.weaponCategory = { equals: weaponCategory as string, mode: "insensitive" };
		if (attunement !== undefined) where.attunement = attunement === "true";
		if (valueMin !== undefined || valueMax !== undefined) {
			const range: Record<string, number> = {};
			if (valueMin !== undefined && !isNaN(Number(valueMin))) range.gte = Number(valueMin);
			if (valueMax !== undefined && !isNaN(Number(valueMax))) range.lte = Number(valueMax);
			if (Object.keys(range).length > 0) where.valueGp = range;
		}

		const [items, total] = await Promise.all([
			prisma.item.findMany({ where, skip: from, take: limit, orderBy: { name: "asc" } }),
			prisma.item.count({ where }),
		]);

		return res.json(paginatedResponse(items, total, pagination));
	} catch (error) {
		console.error("Failed to fetch items:", error);
		return res.status(500).json({ error: "Failed to fetch items" });
	}
}

export async function getItemById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		const item = await prisma.item.findUnique({ where: { id } });

		if (!item) {
			return res.status(404).json({ error: `Item not found with id ${id}` });
		}

		return res.json(item);
	} catch (error) {
		console.error("Failed to fetch item by id:", error);
		return res.status(500).json({ error: "Failed to fetch item" });
	}
}
