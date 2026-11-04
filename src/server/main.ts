import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../lib/swagger";
import authRoutes from "./routes/auth.routes";
import monsterRoutes from "./routes/monster.routes";
import monsterTypeRoutes from "./routes/monterType.routes";
import searchRoutes from "./routes/search.routes";
import spellRoutes from "./routes/spell.routes";
import conditionRoutes from "./routes/condition.routes";
import backgroundRoutes from "./routes/background.routes";
import featRoutes from "./routes/feat.routes";
import classRoutes from "./routes/class.routes";
import itemRoutes from "./routes/item.routes";
import raceRoutes from "./routes/race.routes";
import adventureRoutes from "./routes/adventure.routes";
import npcRoutes from "./routes/npc.routes";
import mapRoutes from "./routes/map.routes";
import partyRoutes from "./routes/party.routes";
import characterRoutes from "./routes/character.routes";
import encounterRoutes from "./routes/encounter.routes";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
	process.env.CLIENT_ORIGIN || "http://localhost,http://dnd.dev,http://localhost:5173"
).split(",");

app.use(cors({ origin: allowedOrigins, credentials: true }));
// Character avatars are stored as base64 data: URLs in the request body
// (see client/src/Module/Characters/util/avatar.ts), so the default 100kb
// express.json() limit needs headroom for that plus base64's ~33% overhead.
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Static image assets
app.use(
	"/api/images",
	express.static(path.join(__dirname, "../../database/data/img")),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/monsters", monsterRoutes);
app.use("/api/monster-types", monsterTypeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/spells", spellRoutes);
app.use("/api/conditions", conditionRoutes);
app.use("/api/backgrounds", backgroundRoutes);
app.use("/api/feats", featRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/adventures", adventureRoutes);
app.use("/api/npcs", npcRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/encounters", encounterRoutes);

app.get("/api/hello", (_, res) => {
	res.json({ text: "Hello from D&D API!" });
});

app.get("/api/health", (_, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api", (_, res) => {
	res.json({
		name: "D&D Toolkit API",
		version: "1.0.0",
		documentation: "/api/docs",
		endpoints: {
			health: "/api/health",
			auth: {
				register: "POST /api/auth/register",
				login: "POST /api/auth/login",
				google: "POST /api/auth/google",
				refresh: "POST /api/auth/refresh",
				logout: "POST /api/auth/logout",
				me: "GET /api/auth/me",
			},
			monsters: {
				list: "GET /api/monsters?page=1&limit=20",
				byId: "GET /api/monsters/:id",
				search: "GET /api/monsters/search?q=dragon",
				filter: "GET /api/monsters/filter?type=dragon&crMin=5",
				stats: "GET /api/monsters/stats",
			},
			search: {
				all: "GET /api/search?q=fire",
				indices: "GET /api/search/indices",
				index: "GET /api/search/:index?q=fire",
			},
			spells: {
				list: "GET /api/spells",
				byId: "GET /api/spells/:id",
			},
			conditions: {
				list: "GET /api/conditions?q=stunned&source=PHB",
				byId: "GET /api/conditions/:id",
			},
			backgrounds: {
				list: "GET /api/backgrounds?q=soldier&source=PHB",
				byId: "GET /api/backgrounds/:id",
			},
			feats: {
				list: "GET /api/feats?q=alert&source=PHB",
				byId: "GET /api/feats/:id",
			},
			classes: {
				list: "GET /api/classes?q=wizard&source=PHB&hitDie=6",
				byId: "GET /api/classes/:id",
			},
			items: {
				list: "GET /api/items?q=sword&type=weapon&weaponType=melee&weaponCategory=martial&armorType=heavy&magic=true&rarity=rare&attunement=true&valueMin=100&valueMax=5000",
				byId: "GET /api/items/:id",
			},
			races: {
				list: "GET /api/races?q=elf&source=PHB&size=M",
				byId: "GET /api/races/:id",
			},
			adventures: {
				list: "GET /api/adventures?q=strahd&storyline=Tyranny of Dragons",
				byId: "GET /api/adventures/:idOrCode",
				section: "GET /api/adventures/:idOrCode/sections/:ordinal",
			},
			npcs: {
				list: "GET /api/npcs?q=strahd&adventure=CoS",
				byId: "GET /api/npcs/:id",
			},
			maps: {
				list: "GET /api/maps?q=cragmaw&adventure=LMoP",
				byId: "GET /api/maps/:id",
			},
			parties: {
				list: "GET /api/parties (auth required)",
				create: "POST /api/parties (auth required)",
				byId: "GET /api/parties/:id (auth required)",
				update: "PATCH /api/parties/:id (auth required)",
				remove: "DELETE /api/parties/:id (auth required)",
				addCharacter: "POST /api/parties/:id/characters/:characterId (auth required)",
				removeCharacter: "DELETE /api/parties/:id/characters/:characterId (auth required)",
			},
			characters: {
				list: "GET /api/characters?partyId=&unassigned=true (auth required)",
				create: "POST /api/characters (auth required)",
				byId: "GET /api/characters/:id (auth required)",
				update: "PATCH /api/characters/:id (auth required)",
				remove: "DELETE /api/characters/:id (auth required)",
			},
			encounters: {
				list: "GET /api/encounters (auth required)",
				create: "POST /api/encounters (auth required)",
				byId: "GET /api/encounters/:id (auth required)",
				update: "PATCH /api/encounters/:id (auth required)",
				remove: "DELETE /api/encounters/:id (auth required)",
				addMonster: "POST /api/encounters/:id/monsters (auth required)",
				updateMonster: "PATCH /api/encounters/:id/monsters/:monsterId (auth required)",
				removeMonster: "DELETE /api/encounters/:id/monsters/:monsterId (auth required)",
			},
		},
	});
});

// Swagger documentation
app.use(
	"/api/docs",
	swaggerUi.serve,
	swaggerUi.setup(null, {
		customCss: ".swagger-ui .topbar { display: none }",
		customSiteTitle: "D&D Toolkit API Docs",
		swaggerOptions: {
			spec: swaggerSpec,
			url: "/swagger.json",
			persistAuthorization: true,
		},
	}),
);

// Serve swagger spec as JSON
app.get("/swagger.json", (_, res) => {
	res.json(swaggerSpec);
});

app.listen(PORT, () => {
	console.log(`D&D Toolkit API running on port ${PORT}`);
	console.log("Documentation: http://localhost:" + PORT + "/api/docs");
	console.log("Available endpoints:");
	console.log("  POST /api/auth/register  - Register with username/email/password");
	console.log("  POST /api/auth/login     - Login with identifier/password");
	console.log("  POST /api/auth/google    - Login/register with a Google ID token");
	console.log("  POST /api/auth/refresh   - Rotate refresh token, issue new access token");
	console.log("  POST /api/auth/logout    - Revoke refresh token");
	console.log("  GET /api/auth/me         - Get current authenticated user");
	console.log("  GET /api/monsters        - List all monsters (paginated)");
	console.log("  GET /api/monsters/search - Search monsters (Elasticsearch)");
	console.log("  GET /api/monsters/filter - Filter monsters");
	console.log("  GET /api/monsters/stats  - Monster statistics");
	console.log("  GET /api/monsters/:id    - Get monster by ID");
	console.log("  GET /api/search          - Search all content");
	console.log("  GET /api/search/indices  - List available indices");
	console.log("  GET /api/search/:index   - Search specific index");
	console.log("  GET /api/spells          - List all spells");
	console.log("  GET /api/conditions      - List all conditions");
	console.log("  GET /api/backgrounds     - List all backgrounds");
	console.log("  GET /api/feats           - List all feats");
	console.log("  GET /api/classes         - List all classes");
	console.log("  GET /api/items           - List all items");
	console.log("  GET /api/races           - List all races");
	console.log("  GET /api/adventures      - List all adventures");
	console.log("  GET /api/npcs            - List all adventure NPCs");
	console.log("  GET /api/maps            - List all adventure maps");
	console.log("  GET /api/health          - Health check");
	console.log("  GET /api/docs            - Swagger UI");
});
