import { apiRequest } from './apiClient';
export const authApi = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  profile: () => apiRequest('/auth/me'),
  changePassword: (payload) => apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) })
};
