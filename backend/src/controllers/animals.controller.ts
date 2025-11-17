import { Request, Response } from "express";
import { z } from "zod";
import { animals, animalTransactions, Animal } from "../models";

const animalSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  breed: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().nonnegative().optional(),
  status: z.union([z.literal("active"), z.literal("sold"), z.literal("deceased")])
});

const transactionSchema = z.object({
  date: z.string().datetime(),
  price: z.number().nonnegative(),
  buyer: z.string().optional(),
  seller: z.string().optional(),
  notes: z.string().optional()
});

export const listAnimals = (_req: Request, res: Response) => {
  return res.json(animals);
};

export const createAnimal = (req: Request, res: Response) => {
  const parsed = animalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const newAnimal: Animal = { id: `a_${Date.now()}`, ...parsed.data };
  animals.push(newAnimal);
  return res.status(201).json(newAnimal);
};

export const purchaseAnimal = (req: Request, res: Response) => {
  const { id } = req.params;
  const animal = animals.find(a => a.id === id);
  if (!animal) return res.status(404).json({ error: "Animal not found" });
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tx = { id: `atx_${Date.now()}`, animalId: id, type: "purchase" as const, ...parsed.data };
  animalTransactions.push(tx);
  animal.status = "active";
  return res.status(201).json(tx);
};

export const sellAnimal = (req: Request, res: Response) => {
  const { id } = req.params;
  const animal = animals.find(a => a.id === id);
  if (!animal) return res.status(404).json({ error: "Animal not found" });
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tx = { id: `atx_${Date.now()}`, animalId: id, type: "sale" as const, ...parsed.data };
  animalTransactions.push(tx);
  animal.status = "sold";
  return res.status(201).json(tx);
};


