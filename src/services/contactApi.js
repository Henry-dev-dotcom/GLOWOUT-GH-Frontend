import { apiRequest } from './apiClient';

export const contactApi = {
  submit: (payload) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(payload) })
};
