import { Router } from "express";
import {
	createCharacter,
	deleteCharacter,
	getCharacterById,
	getCharacters,
	updateCharacter,
} from "../controllers/character.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getCharacters);
router.post("/", createCharacter);
router.get("/:id", getCharacterById);
router.patch("/:id", updateCharacter);
router.delete("/:id", deleteCharacter);

export default router;
