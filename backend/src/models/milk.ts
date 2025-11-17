import { getDb } from "../db/db";
import { ObjectId } from "mongodb";

export interface MilkTransaction {
  _id?: ObjectId | string;
  type: "sale" | "purchase";
  date: string;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  buyer?: string;
  buyerPhone?: string;
  seller?: string;
  sellerPhone?: string;
  notes?: string;
}

const COLLECTION_NAME = "milk_transactions";

export async function getAllMilkTransactions(): Promise<MilkTransaction[]> {
  const db = getDb();
  const transactions = await db.collection<MilkTransaction>(COLLECTION_NAME).find({}).toArray();
  // Convert _id to string for JSON response
  return transactions.map(tx => ({
    ...tx,
    _id: tx._id?.toString() || tx._id
  }));
}

export async function addMilkTransaction(transaction: Omit<MilkTransaction, "_id">): Promise<MilkTransaction> {
  const db = getDb();
  // MongoDB will automatically generate _id
  const newTransaction: Omit<MilkTransaction, "_id"> = {
    ...transaction,
  };
  
  const result = await db.collection<MilkTransaction>(COLLECTION_NAME).insertOne(newTransaction as any);
  
  // Fetch the inserted document with _id
  const inserted = await db.collection<MilkTransaction>(COLLECTION_NAME).findOne({ _id: result.insertedId });
  if (!inserted) {
    throw new Error("Failed to retrieve created transaction");
  }
  
  // Return with _id as string
  return {
    ...inserted,
    _id: inserted._id?.toString() || inserted._id
  };
}


