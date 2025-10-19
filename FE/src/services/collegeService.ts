import api from '../utils/api';

export interface College {
  _id: string;
  name: string;
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
      // Fetch a large list so all predefined colleges appear in dropdown
      params.append('limit', '1000');
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
