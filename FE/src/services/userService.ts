import api from '../utils/api';
<<<<<<< HEAD

export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  profileAvatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  studentDetails?: {
    courseName: string;
    college: string;
    isVerified: boolean;
    placementStatus: string;
    cgpa?: number;
    yearOfCompletion?: number;
    registrationNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    tenthMarks?: {
      percentage?: number;
      marksheet?: string;
    };
    twelfthMarks?: {
      percentage?: number;
      marksheet?: string;
    };
    lastSemesterMarksheet?: string;
    hobbies?: string[];
  };
  recruiterDetails?: {
    companyName: string;
    industry: string;
    designation: string;
    companyInfo?: string;
    companyWebsite?: string;
    verificationStatus: string;
  };
  tnpDetails?: {
    college: string;
    designation: string;
    employeeId?: string;
  };
=======
import { User } from '../types';

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: any;
  message: string;
>>>>>>> 9b124f5 (report and student recommendation)
}

export interface UserResponse {
  success: boolean;
  data: User;
<<<<<<< HEAD
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UserService {
  async getProfile(): Promise<UserResponse> {
    const response = await api.get('/users/me');
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<UserResponse> {
    const response = await api.put('/users/me', profileData);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ success: boolean; data: { profileAvatar: string }; message: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadTenthMarksheet(file: File): Promise<{ success: boolean; data: { tenthMarks: any }; message: string }> {
    const formData = new FormData();
    formData.append('marksheet', file);
    
    const response = await api.post('/users/upload-tenth-marksheet', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadTwelfthMarksheet(file: File): Promise<{ success: boolean; data: { twelfthMarks: any }; message: string }> {
    const formData = new FormData();
    formData.append('marksheet', file);
    
    const response = await api.post('/users/upload-twelfth-marksheet', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadLastSemesterMarksheet(file: File): Promise<{ success: boolean; data: { lastSemesterMarksheet: string }; message: string }> {
    const formData = new FormData();
    formData.append('marksheet', file);
    
    const response = await api.post('/users/upload-last-semester-marksheet', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  }

  async getStudents(params?: any): Promise<UsersResponse> {
    const response = await api.get('/users/students', { params });
    return response.data;
  }

  async verifyStudent(studentId: string, verificationData: {
    isVerified: boolean;
    reason?: string;
  }): Promise<UserResponse> {
    const response = await api.put(`/users/students/${studentId}/verify`, verificationData);
    return response.data;
  }

  async deleteStudent(studentId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/students/${studentId}`);
    return response.data;
  }
}

export const userService = new UserService();
=======
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
};
>>>>>>> 9b124f5 (report and student recommendation)
