import { getDb } from "./index";
import { ObjectId } from "mongodb";

export type AnimalStatus = "active" | "sold" | "deceased";

export interface Animal {
  _id?: ObjectId | string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  status: AnimalStatus;
}

export interface AnimalTransaction {
  _id?: ObjectId | string;
  animalId?: string; // Optional - for standalone transactions (animal name/ID)
  animalName?: string; // Animal name
  animalType?: string; // cow, buffalo, goat, sheep, etc.
  breed?: string; // Animal breed
  gender?: string; // male, female
  type: "sale" | "purchase";
  date: string;
  price: number;
  buyer?: string;
  buyerPhone?: string;
  seller?: string;
  sellerPhone?: string;
  notes?: string;
  location?: string;
  // Additional optional fields
  temperament?: string;
  description?: string;
}

const ANIMALS_COLLECTION = "animals";
const ANIMAL_TRANSACTIONS_COLLECTION = "animal_transactions";

// Animal functions
export async function getAllAnimals(): Promise<Animal[]> {
  const db = getDb();
  const animals = await db.collection<Animal>(ANIMALS_COLLECTION).find({}).toArray();
  return animals.map(animal => ({
    ...animal,
    _id: animal._id?.toString() || animal._id
  }));
}

export async function getAnimalById(id: string): Promise<Animal | null> {
  const db = getDb();
  const animal = await db.collection<Animal>(ANIMALS_COLLECTION).findOne({ _id: new ObjectId(id) });
  if (!animal) return null;
  return {
    ...animal,
    _id: animal._id?.toString() || animal._id
  };
}

export async function addAnimal(animal: Omit<Animal, "_id">): Promise<Animal> {
  const db = getDb();
  const result = await db.collection<Animal>(ANIMALS_COLLECTION).insertOne(animal as any);
  const inserted = await db.collection<Animal>(ANIMALS_COLLECTION).findOne({ _id: result.insertedId });
  if (!inserted) {
    throw new Error("Failed to retrieve created animal");
  }
  return {
    ...inserted,
    _id: inserted._id?.toString() || inserted._id
  };
}

export async function updateAnimalStatus(id: string, status: AnimalStatus): Promise<void> {
  const db = getDb();
  await db.collection<Animal>(ANIMALS_COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );
}

// Animal Transaction functions
export async function getAllAnimalTransactions(): Promise<AnimalTransaction[]> {
  const db = getDb();
  const transactions = await db.collection<AnimalTransaction>(ANIMAL_TRANSACTIONS_COLLECTION).find({}).toArray();
  return transactions.map(tx => ({
    ...tx,
    _id: tx._id?.toString() || tx._id
  }));
}

export async function addAnimalTransaction(transaction: Omit<AnimalTransaction, "_id">): Promise<AnimalTransaction> {
  const db = getDb();
  const result = await db.collection<AnimalTransaction>(ANIMAL_TRANSACTIONS_COLLECTION).insertOne(transaction as any);
  const inserted = await db.collection<AnimalTransaction>(ANIMAL_TRANSACTIONS_COLLECTION).findOne({ _id: result.insertedId });
  if (!inserted) {
    throw new Error("Failed to retrieve created transaction");
  }
  return {
    ...inserted,
    _id: inserted._id?.toString() || inserted._id
  };
}


