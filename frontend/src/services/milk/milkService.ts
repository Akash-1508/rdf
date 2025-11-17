/**
 * Milk Service
 * Handle milk sales and purchase operations
 */

import { MilkTransaction } from '../../types';
import { apiClient } from '../api/apiClient';

export const milkService = {
  recordSale: async (transaction: Omit<MilkTransaction, '_id'>): Promise<MilkTransaction> => {
    const response = await apiClient.post('/milk/sale', {
      date: transaction.date.toISOString(),
      quantity: transaction.quantity,
      pricePerLiter: transaction.pricePerLiter,
      totalAmount: transaction.totalAmount,
      buyer: transaction.buyer,
      buyerPhone: transaction.buyerPhone,
      notes: transaction.notes,
    });
    
    // Convert date string back to Date object
    return {
      ...response,
      date: new Date(response.date),
    };
  },

  recordPurchase: async (transaction: Omit<MilkTransaction, '_id'>): Promise<MilkTransaction> => {
    const response = await apiClient.post('/milk/purchase', {
      date: transaction.date.toISOString(),
      quantity: transaction.quantity,
      pricePerLiter: transaction.pricePerLiter,
      totalAmount: transaction.totalAmount,
      seller: transaction.seller,
      sellerPhone: transaction.sellerPhone,
      notes: transaction.notes,
    });
    
    // Convert date string back to Date object
    return {
      ...response,
      date: new Date(response.date),
    };
  },

  getTransactions: async (startDate?: Date, endDate?: Date): Promise<MilkTransaction[]> => {
    const response = await apiClient.get('/milk');
    
    // Convert date strings back to Date objects
    return response.map((tx: any) => ({
      ...tx,
      date: new Date(tx.date),
    }));
  },
};

