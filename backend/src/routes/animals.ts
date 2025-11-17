import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createAnimal, listAnimals, purchaseAnimal, sellAnimal } from "../controllers/animals.controller";

export const router = Router();

router.get("/", requireAuth, listAnimals);
router.post("/", requireAuth, createAnimal);
router.post("/:id/purchase", requireAuth, purchaseAnimal);
router.post("/:id/sale", requireAuth, sellAnimal);


