import { Router } from "express";
import { getClassById, getClasses } from "../controllers/class.controller";

const router = Router();

router.get("/", getClasses);
router.get("/:id", getClassById);

export default router;
