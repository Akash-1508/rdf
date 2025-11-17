import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { 
  createAnimal, 
  listAnimals, 
  purchaseAnimal, 
  sellAnimal,
  listAnimalTransactions,
  createAnimalSale,
  createAnimalPurchase
} from "../controllers/animals.controller";

export const router = Router();

// Animal routes
router.get("/", requireAuth, listAnimals);
router.post("/", requireAuth, createAnimal);

// Animal transaction routes (linked to specific animal)
router.post("/:id/purchase", requireAuth, purchaseAnimal);
router.post("/:id/sale", requireAuth, sellAnimal);
router.get("/transactions", requireAuth, listAnimalTransactions);

// Standalone transaction routes (like milk transactions)
router.post("/sale", requireAuth, createAnimalSale);
router.post("/purchase", requireAuth, createAnimalPurchase);


