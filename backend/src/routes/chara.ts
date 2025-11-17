import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createCharaConsumption, createCharaPurchase, listCharaConsumptions, listCharaPurchases } from "../controllers/chara.controller";

export const router = Router();

router.get("/purchases", requireAuth, listCharaPurchases);
router.post("/purchases", requireAuth, createCharaPurchase);
router.get("/consumptions", requireAuth, listCharaConsumptions);
router.post("/consumptions", requireAuth, createCharaConsumption);


