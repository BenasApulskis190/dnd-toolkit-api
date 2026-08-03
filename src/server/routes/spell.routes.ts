import { Router } from "express";
import { getSpellById, getSpells } from "../controllers/spell.controller";

const router = Router();

router.get("/", getSpells);
router.get("/:id", getSpellById);

export default router;
