import { apiRequest, withQuery } from './apiClient';
export const productApi = {
  list: (params = {}) => apiRequest(withQuery('/products', params)),
  get: (id) => apiRequest(`/products/${id}`),
  create: (payload) => apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  duplicate: (id) => apiRequest(`/products/${id}/duplicate`, { method: 'POST' }),
  updateStock: (id, stock) => apiRequest(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) }),
  updateAvailability: (id, status) => apiRequest(`/products/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
