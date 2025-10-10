import api from '../utils/api';
<<<<<<< HEAD

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
=======
import { Application } from '../types';
>>>>>>> 9b124f5 (report and student recommendation)

export interface ApplicationResponse {
  success: boolean;
  data: Application;
<<<<<<< HEAD
  message?: string;
=======
  message: string;
>>>>>>> 9b124f5 (report and student recommendation)
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
<<<<<<< HEAD
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
=======
  pagination: any;
  message: string;
}

export const applicationService = {
  applyToJob: async (jobId: string, resumeFile: File): Promise<Application> => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    const response = await api.post<ApplicationResponse>(`/applications/apply/${jobId}`, formData, {
>>>>>>> 9b124f5 (report and student recommendation)
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
<<<<<<< HEAD
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
=======
    
    return response.data.data;
  },

  getMyApplications: async (params?: any): Promise<{ data: Application[]; pagination: any }> => {
    const response = await api.get<ApplicationsResponse>('/applications/my-applications', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getMyJobApplications: async (params?: any): Promise<{ data: Application[]; pagination: any }> => {
    const response = await api.get<ApplicationsResponse>('/applications/my-job-applications', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getJobApplications: async (jobId: string, params?: any): Promise<{ data: Application[]; pagination: any }> => {
    const response = await api.get<ApplicationsResponse>(`/applications/job/${jobId}`, { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  updateApplicationStatus: async (
    applicationId: string, 
    status: string, 
    recruiterNotes?: string, 
    rejectionReason?: string,
    interviewDetails?: any
  ): Promise<Application> => {
    const response = await api.put<ApplicationResponse>(`/applications/${applicationId}/status`, {
      status,
      recruiterNotes,
      rejectionReason,
      interviewDetails,
    });
    
    return response.data.data;
  },

  withdrawApplication: async (applicationId: string): Promise<void> => {
    await api.delete(`/applications/${applicationId}`);
  },
};
>>>>>>> 9b124f5 (report and student recommendation)
