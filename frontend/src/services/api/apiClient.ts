/**
 * API Client
 * Base configuration for API calls
 */

import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

if (!ENV_API_BASE_URL || typeof ENV_API_BASE_URL !== 'string' || !ENV_API_BASE_URL.trim()) {
  throw new Error('API_BASE_URL is not set. Define it in frontend/.env');
}
const API_BASE_URL = ENV_API_BASE_URL.trim();

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any) {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = json?.error || res.statusText || 'Request failed';
    throw new Error(typeof message === 'string' ? message : 'Request failed');
  }
  return json;
}

export const apiClient = {
  get: async (endpoint: string) => {
    return request('GET', endpoint);
  },
  post: async (endpoint: string, data: any) => {
    return request('POST', endpoint, data);
  },
  put: async (endpoint: string, data: any) => {
    return request('PUT', endpoint, data);
  },
  delete: async (endpoint: string) => {
    return request('DELETE', endpoint);
  },
};

