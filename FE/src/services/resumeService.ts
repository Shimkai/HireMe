import api from '../utils/api';

export interface Resume {
  _id?: string;
  studentId: string;
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country: string;
    };
  };
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    cgpa?: number;
    percentage?: number;
    yearOfCompletion: number;
    achievements?: string[];
  }>;
  skills: {
    technical: Array<{
      name: string;
      proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    }>;
    soft: string[];
    languages: Array<{
      name: string;
      proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
    }>;
  };
  projects: Array<{
    title: string;
    description: string;
    techUsed: string[];
    link?: string;
    githubLink?: string;
    startDate?: string;
    endDate?: string;
    isOngoing: boolean;
    teamSize?: number;
    role?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    isCurrentJob: boolean;
    description?: string;
    technologies?: string[];
    achievements?: string[];
  }>;
  achievements: Array<{
    title: string;
    description?: string;
    date?: string;
    category: 'Academic' | 'Technical' | 'Sports' | 'Cultural' | 'Leadership' | 'Other';
  }>;
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  isComplete: boolean;
  lastUpdated: string;
  templateUsed: string;
  visibility: {
    public: boolean;
    recruitersOnly: boolean;
  };
}

export interface ResumeResponse {
  success: boolean;
  data: Resume;
  message?: string;
}

class ResumeService {
  async getResume(): Promise<ResumeResponse> {
    const response = await api.get('/resume');
    return response.data;
  }

  async createResume(resumeData: Partial<Resume>): Promise<ResumeResponse> {
    const response = await api.post('/resume', resumeData);
    return response.data;
  }

  async updateResume(resumeData: Partial<Resume>): Promise<ResumeResponse> {
    const response = await api.put('/resume', resumeData);
    return response.data;
  }

  async generateResumePDF(template?: string): Promise<Blob> {
    const response = await api.get(`/resume/pdf${template ? `?template=${template}` : ''}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getStudentResume(studentId: string): Promise<ResumeResponse> {
    const response = await api.get(`/resume/${studentId}`);
    return response.data;
  }
}

export const resumeService = new ResumeService();
