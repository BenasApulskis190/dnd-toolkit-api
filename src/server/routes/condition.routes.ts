import { Router } from "express";
import { getConditions, getConditionById } from "../controllers/condition.controller";

const router = Router();

router.get("/", getConditions);
router.get("/:id", getConditionById);

export default router;
