import { Router } from "express";
import {
	getAdventures,
	getAdventureById,
	getAdventureSection,
} from "../controllers/adventure.controller";

const router = Router();

router.get("/", getAdventures);
router.get("/:id", getAdventureById);
router.get("/:id/sections/:ordinal", getAdventureSection);

export default router;
