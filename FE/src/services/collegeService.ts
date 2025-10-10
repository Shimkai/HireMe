import api from '../utils/api';

export interface College {
  _id: string;
  name: string;
<<<<<<< HEAD
}

export interface CollegeResponse {
  success: boolean;
  data: College[];
  message?: string;
}

class CollegeService {
  async getAllColleges(): Promise<CollegeResponse> {
    const response = await api.get('/colleges');
    return response.data;
  }
}

export const collegeService = new CollegeService();
=======
  createdAt: string;
  updatedAt: string;
}

export interface CollegesResponse {
  success: boolean;
  data: College[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const collegeService = {
  async getColleges(search?: string): Promise<College[]> {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      
      const response = await api.get<CollegesResponse>(`/colleges?${params.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch colleges');
    } catch (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }
  },
};
>>>>>>> 9b124f5 (report and student recommendation)
