import { Router } from "express";
import { getBackgrounds, getBackgroundById } from "../controllers/background.controller";

const router = Router();

router.get("/", getBackgrounds);
router.get("/:id", getBackgroundById);

export default router;
