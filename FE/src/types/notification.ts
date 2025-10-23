export interface Notification {
  id: string;
  _id?: string; // Fallback for when id is not available
  userId: string;
  role: 'Student' | 'TnP' | 'Recruiter';
  title: string;
  message: string;
  type: 'job_posting' | 'application_status' | 'job_approval' | 'job_rejection' | 'general';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    status?: string;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  timestamp: Date; // For backward compatibility
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
