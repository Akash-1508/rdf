/**
 * App Constants
 * Centralized constants for the application
 */

export const APP_NAME = 'Dairy Farm Management';

export const ROUTES = {
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  DASHBOARD: 'Dashboard',
  ANIMAL_SALES: 'AnimalSales',
  ANIMAL_PURCHASE: 'AnimalPurchase',
  MILK_SALES: 'MilkSales',
  MILK_PURCHASE: 'MilkPurchase',
  CHARA_PURCHASE: 'CharaPurchase',
  DAILY_CHARA_CONSUMPTION: 'DailyCharaConsumption',
  PROFIT_LOSS: 'ProfitLoss',
};

export const ANIMAL_TYPES = ['Cow', 'Buffalo', 'Goat', 'Sheep'] as const;

export const ANIMAL_STATUS = ['active', 'sold', 'deceased'] as const;

