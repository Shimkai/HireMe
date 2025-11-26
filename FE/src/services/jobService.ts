import api from '../utils/api';
import { Job } from '../types';

export const jobService = {
  getAllJobs: async (params?: any): Promise<{ data: Job[]; pagination: any }> => {
    const response = await api.get('/jobs', { params });
    // Backend returns { success: true, data: [...], pagination: {...} }
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {}
    };
  },

  exportJobApplications: async (jobId: string, status: string = 'all') => {
    const response = await api.get(`/jobs/${jobId}/applications/export`, {
      params: { status },
      responseType: 'blob',
    });
    return response;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data;
  },

  createJob: async (data: any): Promise<Job> => {
    const response = await api.post('/jobs', data);
    return response.data.data;
  },

  updateJob: async (id: string, data: any): Promise<Job> => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  approveJob: async (id: string, notes?: string): Promise<Job> => {
    const response = await api.put(`/jobs/${id}/approve`, { approvalNotes: notes });
    return response.data.data;
  },

  rejectJob: async (id: string, reason: string): Promise<Job> => {
    const response = await api.put(`/jobs/${id}/reject`, { rejectionReason: reason });
    return response.data.data;
  },
};

