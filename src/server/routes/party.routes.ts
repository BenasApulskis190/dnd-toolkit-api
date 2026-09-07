import { Router } from "express";
import {
	addCharacterToParty,
	createParty,
	deleteParty,
	getPartyById,
	getParties,
	removeCharacterFromParty,
	updateParty,
} from "../controllers/party.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getParties);
router.post("/", createParty);
router.get("/:id", getPartyById);
router.patch("/:id", updateParty);
router.delete("/:id", deleteParty);
router.post("/:id/characters/:characterId", addCharacterToParty);
router.delete("/:id/characters/:characterId", removeCharacterFromParty);

export default router;
