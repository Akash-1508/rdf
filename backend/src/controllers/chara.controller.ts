import { Request, Response } from "express";
import { z } from "zod";
import { charaPurchases, charaConsumptions, CharaPurchase, DailyCharaConsumption } from "../models";

const purchaseSchema = z.object({
  date: z.string().datetime(),
  quantity: z.number().nonnegative(),
  pricePerKg: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  supplier: z.string().optional(),
  notes: z.string().optional()
});

const consumptionSchema = z.object({
  date: z.string().datetime(),
  quantity: z.number().nonnegative(),
  animalId: z.string().optional(),
  notes: z.string().optional()
});

export const listCharaPurchases = (_req: Request, res: Response) => {
  return res.json(charaPurchases);
};

export const createCharaPurchase = (req: Request, res: Response) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item: CharaPurchase = { id: `cp_${Date.now()}`, ...parsed.data };
  charaPurchases.push(item);
  return res.status(201).json(item);
};

export const listCharaConsumptions = (_req: Request, res: Response) => {
  return res.json(charaConsumptions);
};

export const createCharaConsumption = (req: Request, res: Response) => {
  const parsed = consumptionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item: DailyCharaConsumption = { id: `cc_${Date.now()}`, ...parsed.data };
  charaConsumptions.push(item);
  return res.status(201).json(item);
};


