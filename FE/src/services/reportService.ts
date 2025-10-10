import api from '../utils/api';

export interface ReportData {
  studentsPerCompany: Array<{
    company: string;
    students: number;
  }>;
  jobsByRecruiter: Array<{
    recruiter: string;
    jobs: number;
  }>;
  placementByBranch: Array<{
    branch: string;
    placed: number;
    total: number;
    percentage: number;
  }>;
  applicationsVsSelections: Array<{
    month: string;
    applications: number;
    selections: number;
  }>;
  statistics?: {
    totalStudents: number;
    totalJobs: number;
    totalApplications: number;
    totalSelections: number;
    totalRecruiters: number;
    placementRate: number;
    lastUpdated: string;
  };
}

export interface ReportResponse {
  success: boolean;
  data: ReportData;
}

export const reportService = {
  async getReportData(): Promise<ReportData> {
    try {
      const response = await api.get<ReportResponse>('/analytics/report');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch report data');
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  },

  async downloadReportPDF(reportType: string): Promise<Blob> {
    try {
      const response = await api.get(`/analytics/report/pdf/${reportType}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error downloading report PDF:', error);
      throw error;
    }
  }
};
