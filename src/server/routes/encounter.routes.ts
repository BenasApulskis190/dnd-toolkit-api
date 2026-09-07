import { Router } from "express";
import {
	addLootToEncounter,
	addMonsterToEncounter,
	createEncounter,
	deleteEncounter,
	getEncounterById,
	getEncounters,
	removeLootFromEncounter,
	removeMonsterFromEncounter,
	updateEncounter,
	updateEncounterLoot,
	updateEncounterMonster,
} from "../controllers/encounter.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getEncounters);
router.post("/", createEncounter);
router.get("/:id", getEncounterById);
router.patch("/:id", updateEncounter);
router.delete("/:id", deleteEncounter);
router.post("/:id/monsters", addMonsterToEncounter);
router.patch("/:id/monsters/:monsterId", updateEncounterMonster);
router.delete("/:id/monsters/:monsterId", removeMonsterFromEncounter);
router.post("/:id/loot", addLootToEncounter);
router.patch("/:id/loot/:lootId", updateEncounterLoot);
router.delete("/:id/loot/:lootId", removeLootFromEncounter);

export default router;
