import api from '../utils/api';

export interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    jobType: string;
    ctc: {
      min: number;
      max: number;
      currency: string;
    };
    applicationDeadline: string;
  };
  studentId: string;
  status: string;
  resume: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedAt: string;
  };
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  interviewDetails?: {
    scheduledDate?: string;
    scheduledTime?: string;
    interviewMode?: string;
    meetingLink?: string;
    venue?: string;
    instructions?: string;
    round: number;
  };
  recruiterNotes?: string;
  rejectionReason?: string;
  viewedByRecruiter: boolean;
  viewedAt?: string;
}

export interface ApplicationResponse {
  success: boolean;
  data: Application;
  message?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApplicationService {
  async applyToJob(jobId: string, formData: FormData): Promise<ApplicationResponse> {
    const response = await api.post(`/applications/apply/${jobId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getMyApplications(params?: any): Promise<ApplicationsResponse> {
    const response = await api.get('/applications/my-applications', { params });
    return response.data;
  }

  async getJobApplications(jobId: string, params?: any): Promise<ApplicationsResponse> {
    const response = await api.get(`/applications/job/${jobId}`, { params });
    return response.data;
  }

  async updateApplicationStatus(
    applicationId: string,
    statusData: {
      status: string;
      recruiterNotes?: string;
      interviewDetails?: {
        scheduledDate?: string;
        scheduledTime?: string;
        interviewMode?: string;
        meetingLink?: string;
        venue?: string;
        instructions?: string;
        round?: number;
      };
    }
  ): Promise<ApplicationResponse> {
    const response = await api.put(`/applications/${applicationId}/status`, statusData);
    return response.data;
  }

  async withdrawApplication(applicationId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  }

  async getRecruiterApplications(params?: any): Promise<ApplicationsResponse> {
    const response = await api.get('/applications/recruiter', { params });
    return response.data;
  }

  async getAllApplications(params?: any): Promise<ApplicationsResponse> {
    const response = await api.get('/applications/all', { params });
    return response.data;
  }
}

export const applicationService = new ApplicationService();
