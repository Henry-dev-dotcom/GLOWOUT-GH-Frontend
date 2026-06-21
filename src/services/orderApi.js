import { apiRequest, withQuery } from './apiClient';
export const orderApi = {
  checkout: (payload) => apiRequest('/orders/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  list: (params = {}) => apiRequest(withQuery('/orders', params)),
  get: (id) => apiRequest(`/orders/${id}`),
  updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updatePayment: (id, paymentStatus) => apiRequest(`/orders/${id}/payment`, { method: 'PATCH', body: JSON.stringify({ paymentStatus }) }),
  updateFulfillment: (id, payload) => apiRequest(`/orders/${id}/fulfillment`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/orders/${id}`, { method: 'DELETE' })
};
