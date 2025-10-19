import api from '../utils/api';

export interface SkillMatch {
  matchingSkills: string[];
  matchPercentage: number;
}

export interface StudentRecommendation {
  student: {
    _id: string;
    fullName: string;
    email: string;
    profileAvatar?: string;
    branch?: string;
    cgpa?: number;
    yearOfCompletion?: number;
    skills?: string[];
    registrationNumber?: string;
  };
  score: number;
  skillMatch: SkillMatch;
  meetsRequirements: {
    cgpa: boolean;
    branch: boolean;
  };
}

export interface RecommendationStats {
  totalRecommendations: number;
  averageScore: number;
  topScore: number;
  skillMatchDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

/**
 * Get recommended students for a specific job
 */
export const getRecommendedStudents = async (
  jobId: string,
  options?: { limit?: number; minScore?: number }
): Promise<StudentRecommendation[]> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.minScore) params.append('minScore', options.minScore.toString());

  const queryString = params.toString();
  const url = `/student-recommendations/jobs/${jobId}/students${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.data.data;
};

/**
 * Get recommendation statistics for a job
 */
export const getRecommendationStats = async (jobId: string): Promise<RecommendationStats> => {
  const response = await api.get(`/student-recommendations/jobs/${jobId}/stats`);
  return response.data.data;
};

export const studentRecommendationService = {
  getRecommendedStudents,
  getRecommendationStats,
};

export default studentRecommendationService;

