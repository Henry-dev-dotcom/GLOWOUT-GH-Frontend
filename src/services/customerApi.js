import { apiRequest, withQuery } from './apiClient';
export const customerApi = {
  list: (params = {}) => apiRequest(withQuery('/customers', params)),
  get: (id) => apiRequest(`/customers/${id}`),
  update: (id, payload) => apiRequest(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
};
