import { apiRequest } from './apiClient';
export const marketingApi = {
  list: () => apiRequest('/marketing'),
  create: (payload) => apiRequest('/marketing/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/marketing/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/marketing/campaigns/${id}`, { method: 'DELETE' })
};
