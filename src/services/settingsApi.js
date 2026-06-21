import { apiRequest } from './apiClient';
export const settingsApi = {
  read: () => apiRequest('/settings'),
  update: (payload) => apiRequest('/settings', { method: 'PATCH', body: JSON.stringify(payload) })
};
