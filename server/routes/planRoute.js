import express from "express";
import { getUserPlan, updatePlan } from "../controllers/planController.js";

const router = express.Router();

router.post("/getUserPlan", getUserPlan);
router.post("/updatePlan", updatePlan);

export default router;
