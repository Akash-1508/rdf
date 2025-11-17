import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createMilkPurchase, createMilkSale, listMilkTransactions } from "../controllers/milk.controller";

export const router = Router();

router.get("/", requireAuth, listMilkTransactions);
router.post("/sale", requireAuth, createMilkSale);
router.post("/purchase", requireAuth, createMilkPurchase);


