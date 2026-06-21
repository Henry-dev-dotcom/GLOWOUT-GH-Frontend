import { apiRequest, withQuery } from './apiClient';
export const couponApi = {
  list: (params = {}) => apiRequest(withQuery('/coupons', params)),
  create: (payload) => apiRequest('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/coupons/${id}`, { method: 'DELETE' }),
  duplicate: (id) => apiRequest(`/coupons/${id}/duplicate`, { method: 'POST' }),
  validate: (payload) => apiRequest('/coupons/validate', { method: 'POST', body: JSON.stringify(payload) })
};
