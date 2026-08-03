import { Router } from "express";
import { getRaces, getRaceById } from "../controllers/race.controller";

const router = Router();

router.get("/", getRaces);
router.get("/:id", getRaceById);

export default router;
