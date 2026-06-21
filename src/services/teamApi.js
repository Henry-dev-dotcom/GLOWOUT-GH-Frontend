import { apiRequest } from './apiClient';
export const teamApi = {
  list: () => apiRequest('/team'),
  create: (payload) => apiRequest('/team', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/team/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/team/${id}`, { method: 'DELETE' })
};
