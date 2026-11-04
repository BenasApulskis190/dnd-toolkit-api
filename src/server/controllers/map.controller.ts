import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { parsePagination, paginatedResponse } from "../../lib/pagination";
import { imagePathToUrl } from "../../lib/transformers";

const mapInclude = {
	pins: true,
	section: {
		select: {
			id: true,
			ordinal: true,
			name: true,
			adventure: { select: { id: true, code: true, name: true } },
		},
	},
} as const;

type MapWithSection = {
	imagePath: string;
	section: {
		id: string;
		ordinal: number;
		name: string;
		adventure: { id: string; code: string; name: string };
	};
};

// Maps live two levels down (adventure -> section -> map), but the client lists
// them as standalone entities, so the section/adventure refs are lifted up.
function flattenMap<T extends MapWithSection>({ section, ...map }: T) {
	return {
		...map,
		imageUrl: imagePathToUrl(map.imagePath),
		section: { id: section.id, ordinal: section.ordinal, name: section.name },
		adventure: section.adventure,
	};
}

export async function getMaps(req: Request, res: Response) {
	try {
		const pagination = parsePagination(req.query);
		const { limit, from } = pagination;
		const q = (req.query.q as string) || "";
		const { adventure } = req.query;

		const where: Record<string, unknown> = {};
		// A map's own name ("Cragmaw Hideout") is the obvious search target, but
		// people also look for "every map in Phandelver", so the adventure's
		// name/code and the chapter name match too.
		if (q) {
			where.OR = [
				{ name: { contains: q, mode: "insensitive" } },
				{ section: { name: { contains: q, mode: "insensitive" } } },
				{ section: { adventure: { name: { contains: q, mode: "insensitive" } } } },
				{ section: { adventure: { code: { contains: q, mode: "insensitive" } } } },
			];
		}
		if (adventure) {
			where.section = {
				adventure: { code: { equals: adventure as string, mode: "insensitive" } },
			};
		}

		const [maps, total] = await Promise.all([
			prisma.adventureMap.findMany({
				where,
				skip: from,
				take: limit,
				orderBy: [
					{ section: { adventure: { name: "asc" } } },
					{ section: { ordinal: "asc" } },
					{ ordinal: "asc" },
				],
				include: mapInclude,
			}),
			prisma.adventureMap.count({ where }),
		]);

		return res.json(paginatedResponse(maps.map(flattenMap), total, pagination));
	} catch (error) {
		console.error("Failed to fetch maps:", error);
		return res.status(500).json({ error: "Failed to fetch maps" });
	}
}

export async function getMapById(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		const map = await prisma.adventureMap.findUnique({
			where: { id },
			include: mapInclude,
		});

		if (!map) {
			return res.status(404).json({ error: `Map not found with id ${id}` });
		}

		return res.json(flattenMap(map));
	} catch (error) {
		console.error("Failed to fetch map by id:", error);
		return res.status(500).json({ error: "Failed to fetch map" });
	}
}
