import api from '../utils/api';
import { User } from '../types';

export const authService = {
  register: async (data: any): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  verifyToken: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/verify-token');
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};

