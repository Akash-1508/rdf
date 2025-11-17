export interface MilkTransaction {
  id: string;
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

export const milkTransactions: MilkTransaction[] = [];


