/**
 * TypeScript type definitions for Dairy Farm Management App
 */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

// Animal Types
export interface Animal {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  purchaseDate?: Date;
  purchasePrice?: number;
  status: 'active' | 'sold' | 'deceased';
}

export interface AnimalMedia {
  uri: string;
  type: 'image' | 'video';
  name?: string;
}

export interface AnimalTransaction {
  id: string;
  animalId: string;
  type: 'sale' | 'purchase';
  date: Date;
  price: number;
  buyer?: string;
  seller?: string;
  notes?: string;
  images?: AnimalMedia[];
  videos?: AnimalMedia[];
}

// Milk Types
export interface MilkTransaction {
  id: string;
  type: 'sale' | 'purchase';
  date: Date;
  quantity: number; // in liters
  pricePerLiter: number;
  totalAmount: number;
  buyer?: string;
  buyerPhone?: string;
  seller?: string;
  sellerPhone?: string;
  notes?: string;
}

// Chara (Fodder) Types
export interface CharaPurchase {
  id: string;
  date: Date;
  quantity: number; // in kg
  pricePerKg: number;
  totalAmount: number;
  supplier?: string;
  notes?: string;
}

export interface DailyCharaConsumption {
  id: string;
  date: Date;
  quantity: number; // in kg
  animalId?: string;
  notes?: string;
}

// Profit/Loss Types
export interface ProfitLossReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  loss: number;
  details: {
    milkSales: number;
    animalSales: number;
    milkPurchases: number;
    animalPurchases: number;
    charaPurchases: number;
    otherExpenses: number;
  };
}

