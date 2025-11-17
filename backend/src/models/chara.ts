export interface CharaPurchase {
  id: string;
  date: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  supplier?: string;
  notes?: string;
}

export interface DailyCharaConsumption {
  id: string;
  date: string;
  quantity: number;
  animalId?: string;
  notes?: string;
}

export const charaPurchases: CharaPurchase[] = [];
export const charaConsumptions: DailyCharaConsumption[] = [];


