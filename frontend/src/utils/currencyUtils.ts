/**
 * Currency Utility Functions
 * Helper functions for currency formatting
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

