export type AnimalStatus = "active" | "sold" | "deceased";

export interface Animal {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  status: AnimalStatus;
}

export interface AnimalTransaction {
  id: string;
  animalId: string;
  type: "sale" | "purchase";
  date: string;
  price: number;
  buyer?: string;
  seller?: string;
  notes?: string;
}

export const animals: Animal[] = [];
export const animalTransactions: AnimalTransaction[] = [];


