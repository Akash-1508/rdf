import { Request, Response } from "express";
import { z } from "zod";
import { milkTransactions, MilkTransaction } from "../models";

const milkTxSchema = z.object({
  date: z.string().datetime(),
  quantity: z.number().nonnegative(),
  pricePerLiter: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  buyer: z.string().optional(),
  buyerPhone: z.string().optional(),
  seller: z.string().optional(),
  sellerPhone: z.string().optional(),
  notes: z.string().optional()
});

export const listMilkTransactions = (_req: Request, res: Response) => {
  return res.json(milkTransactions);
};

export const createMilkSale = (req: Request, res: Response) => {
  const parsed = milkTxSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tx: MilkTransaction = { id: `mtx_${Date.now()}`, type: "sale", ...parsed.data };
  milkTransactions.push(tx);
  return res.status(201).json(tx);
};

export const createMilkPurchase = (req: Request, res: Response) => {
  const parsed = milkTxSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tx: MilkTransaction = { id: `mtx_${Date.now()}`, type: "purchase", ...parsed.data };
  milkTransactions.push(tx);
  return res.status(201).json(tx);
};


