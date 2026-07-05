import { apiRequest } from './apiClient';

export const paymentApi = {
  initialize: (orderId) => apiRequest('/payments/paystack/initialize', { method: 'POST', body: JSON.stringify({ orderId }) }),
  verify: (reference) => apiRequest(`/payments/paystack/verify/${encodeURIComponent(reference)}`)
};
