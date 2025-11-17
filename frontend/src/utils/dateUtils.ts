/**
 * Date Utility Functions
 * Helper functions for date operations
 */

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN');
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-IN');
};

export const getToday = (): Date => {
  return new Date();
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

