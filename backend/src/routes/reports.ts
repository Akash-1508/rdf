import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getProfitLoss } from "../controllers/reports.controller";

export const router = Router();

router.get("/profit-loss", requireAuth, getProfitLoss);


