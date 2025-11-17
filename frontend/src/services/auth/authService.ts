/**
 * Authentication Service
 * Handle user login, signup, and authentication
 */

import { User } from '../../types';
import { apiClient, setAuthToken } from '../api/apiClient';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res?.token) {
      setAuthToken(res.token);
    }
    return res.user as User;
  },

  signup: async (
    name: string,
    email: string,
    password: string,
    mobile: string,
    gender?: string,
    address?: string,
    otp?: string
  ): Promise<User> => {
    const res = await apiClient.post('/auth/signup', {
      name,
      email,
      password,
      mobile,
      gender,
      address,
      otp,
    });
    return res as User;
  },

  logout: async (): Promise<void> => {
    setAuthToken(null);
  },

  getCurrentUser: async (): Promise<User | null> => {
    // No persistent storage yet; return null in this simple client
    return null;
  },
};

