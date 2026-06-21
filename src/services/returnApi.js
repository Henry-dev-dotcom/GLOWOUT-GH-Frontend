import { apiRequest, withQuery } from './apiClient';
export const returnApi = {
  list: (params = {}) => apiRequest(withQuery('/returns', params)),
  get: (id) => apiRequest(`/returns/${id}`),
  create: (payload) => apiRequest('/returns', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/returns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/returns/${id}`, { method: 'DELETE' })
};
