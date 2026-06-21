import { apiRequest, withQuery } from './apiClient';
export const reportApi = {
  analytics: (params = {}) => apiRequest(withQuery('/reports/analytics', params)),
  finance: (params = {}) => apiRequest(withQuery('/reports/finance', params)),
  products: (params = {}) => apiRequest(withQuery('/reports/products', params)),
  customers: (params = {}) => apiRequest(withQuery('/reports/customers', params))
};
