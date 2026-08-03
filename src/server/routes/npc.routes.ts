import { Router } from "express";
import { getNpcs, getNpcById } from "../controllers/npc.controller";

const router = Router();

router.get("/", getNpcs);
router.get("/:id", getNpcById);

export default router;
