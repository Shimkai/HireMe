import api from '../utils/api';
import { Application } from '../types';

export interface ApplicationResponse {
  success: boolean;
  data: Application;
  message: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination: any;
  message: string;
}

export const applicationService = {
  applyToJob: async (jobId: string, resumeFile: File): Promise<Application> => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    const response = await api.post<ApplicationResponse>(`/applications/apply/${jobId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
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
