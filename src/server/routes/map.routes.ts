import { Router } from "express";
import { getMaps, getMapById } from "../controllers/map.controller";

const router = Router();

router.get("/", getMaps);
router.get("/:id", getMapById);

export default router;
