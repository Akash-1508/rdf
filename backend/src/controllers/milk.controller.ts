import { Request, Response } from "express";
import { z } from "zod";
import { getAllMilkTransactions, addMilkTransaction } from "../models";

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

export const listMilkTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await getAllMilkTransactions();
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch milk transactions" });
  }
};

export const createMilkSale = async (req: Request, res: Response) => {
  const parsed = milkTxSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  try {
    const tx = await addMilkTransaction({ type: "sale", ...parsed.data });
    return res.status(201).json(tx);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create milk sale" });
  }
};

export const createMilkPurchase = async (req: Request, res: Response) => {
  const parsed = milkTxSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  try {
    const tx = await addMilkTransaction({ type: "purchase", ...parsed.data });
    return res.status(201).json(tx);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create milk purchase" });
  }
};


