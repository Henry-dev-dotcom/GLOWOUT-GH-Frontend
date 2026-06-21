import { apiRequest, withQuery } from './apiClient';
export const categoryApi = {
  list: (params = {}) => apiRequest(withQuery('/categories', params)),
  get: (id) => apiRequest(`/categories/${id}`),
  create: (payload) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
  duplicate: (id) => apiRequest(`/categories/${id}/duplicate`, { method: 'POST' })
};
