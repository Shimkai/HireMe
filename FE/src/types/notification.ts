export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'job_posting' | 'application_status' | 'job_approval' | 'job_rejection' | 'general';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    status?: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
