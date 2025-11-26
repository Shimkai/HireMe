import api from '../utils/api';
import { User } from '../types';

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: any;
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

export const userService = {
  getStudents: async (params?: any): Promise<{ data: User[]; pagination: any }> => {
    const response = await api.get<UsersResponse>('/users/students', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  exportStudents: async (params?: any): Promise<any> => {
    const response = await api.get('/users/students/export', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  verifyStudent: async (studentId: string, isVerified: boolean, reason?: string): Promise<User> => {
    const response = await api.put<UserResponse>(`/users/students/${studentId}/verify`, {
      isVerified,
      reason,
    });
    return response.data.data;
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    await api.delete(`/users/students/${studentId}`);
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<UserResponse>('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: any): Promise<User> => {
    const response = await api.put<UserResponse>('/users/me', data);
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
