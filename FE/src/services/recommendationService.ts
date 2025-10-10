import api from '../utils/api';

export interface JobRecommendation {
  job: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    jobType: string;
    designation: string;
    skillsRequired: string[];
    eligibility: {
      minCGPA?: number;
      allowedCourses?: string[];
      maxBacklogs?: number;
      yearOfCompletion?: number[];
    };
    ctc: {
      min: number;
      max: number;
      currency: string;
    };
    experienceRequired: string;
    applicationDeadline: string;
    postedBy: {
      _id: string;
      fullName: string;
      email: string;
    };
    status: string;
    jobCategory?: string;
    workMode: string;
    applicationCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  matchPercentage: number;
  reasons: string[];
}

export interface RecommendationsResponse {
  success: boolean;
  data: JobRecommendation[];
  message: string;
}

export const recommendationService = {
  // Get job recommendations for the current student
  getMyRecommendations: async (limit: number = 6): Promise<JobRecommendation[]> => {
    const response = await api.get<RecommendationsResponse>(`/recommendations/my-recommendations?limit=${limit}`);
    return response.data.data;
  },

  // Get job recommendations for a specific student (for TnP/Admin)
  getStudentRecommendations: async (studentId: string, limit: number = 6): Promise<JobRecommendation[]> => {
    const response = await api.get<RecommendationsResponse>(`/recommendations/student/${studentId}?limit=${limit}`);
    return response.data.data;
  },

  // Get bulk recommendations for multiple students (for analytics)
  getBulkRecommendations: async (studentIds: string[], limit: number = 6): Promise<{ [studentId: string]: JobRecommendation[] }> => {
    const response = await api.post<{ success: boolean; data: { [studentId: string]: JobRecommendation[] }; message: string }>(
      `/recommendations/bulk?limit=${limit}`,
      { studentIds }
    );
    return response.data.data;
  },
};
