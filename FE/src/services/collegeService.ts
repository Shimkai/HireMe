import api from '../utils/api';

export interface College {
  _id: string;
  name: string;
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
