import { Router } from "express";
import { getClasses, getClassById } from "../controllers/class.controller";

const router = Router();

router.get("/", getClasses);
router.get("/:id", getClassById);

export default router;
