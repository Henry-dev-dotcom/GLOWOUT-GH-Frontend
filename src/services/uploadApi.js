import { apiRequest } from './apiClient';
export const uploadApi = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return apiRequest('/uploads/image', { method: 'POST', body: form });
  }
};
