import { Router } from "express";
import { getFeats, getFeatById } from "../controllers/feat.controller";

const router = Router();

router.get("/", getFeats);
router.get("/:id", getFeatById);

export default router;
