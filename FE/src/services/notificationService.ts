import { Notification } from '../types/notification';

// Dummy notification data based on user role
export const getDummyNotifications = (userRole: string): Notification[] => {
  const baseNotifications: Notification[] = [];
  
  if (userRole === 'Student') {
    return [
      {
        id: '1',
        title: 'New Job Posted',
        message: 'Software Engineer position at TechCorp has been posted. Apply now!',
        type: 'job_posting',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        metadata: { jobId: 'job1' }
      },
      {
        id: '2',
        title: 'Application Status Update',
        message: 'Congratulations! Your application for Data Scientist at DataCorp has been accepted. You are now placed!',
        type: 'application_status',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        metadata: { applicationId: 'app1', status: 'Placed' }
      },
      {
        id: '3',
        title: 'New Job Posted',
        message: 'Frontend Developer role at WebTech is now available for applications.',
        type: 'job_posting',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        isRead: true,
        metadata: { jobId: 'job2' }
      },
      {
        id: '4',
        title: 'Application Status Update',
        message: 'Your application for Backend Developer at ServerCorp is under review.',
        type: 'application_status',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        isRead: true,
        metadata: { applicationId: 'app2', status: 'Under Review' }
      },
      {
        id: '5',
        title: 'New Job Posted',
        message: 'DevOps Engineer position at CloudTech is now open for applications.',
        type: 'job_posting',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        isRead: true,
        metadata: { jobId: 'job3' }
      }
    ];
  } else if (userRole === 'TnP') {
    return [
      {
        id: '1',
        title: 'Job Approval Required',
        message: 'Software Engineer job at TechCorp is pending your approval.',
        type: 'job_approval',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        isRead: false,
        metadata: { jobId: 'job1' }
      },
      {
        id: '2',
        title: 'Job Approval Required',
        message: 'Data Scientist position at DataCorp needs your review and approval.',
        type: 'job_approval',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        isRead: false,
        metadata: { jobId: 'job2' }
      },
      {
        id: '3',
        title: 'Job Approval Required',
        message: 'Frontend Developer role at WebTech is awaiting your approval.',
        type: 'job_approval',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
        metadata: { jobId: 'job3' }
      },
      {
        id: '4',
        title: 'Job Approval Required',
        message: 'Backend Developer position at ServerCorp needs your review.',
        type: 'job_approval',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        isRead: true,
        metadata: { jobId: 'job4' }
      }
    ];
  } else if (userRole === 'Recruiter') {
    return [
      {
        id: '1',
        title: 'Job Approved',
        message: 'Your Software Engineer job at TechCorp has been approved by TnP and is now live!',
        type: 'job_approval',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        isRead: false,
        metadata: { jobId: 'job1' }
      },
      {
        id: '2',
        title: 'Job Rejected',
        message: 'Your Data Scientist position at DataCorp was rejected by TnP. Please review the feedback.',
        type: 'job_rejection',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        isRead: false,
        metadata: { jobId: 'job2' }
      },
      {
        id: '3',
        title: 'Job Approved',
        message: 'Your Frontend Developer role at WebTech has been approved and is now visible to students.',
        type: 'job_approval',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
        metadata: { jobId: 'job3' }
      },
      {
        id: '4',
        title: 'Job Approved',
        message: 'Your Backend Developer position at ServerCorp has been approved by TnP.',
        type: 'job_approval',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        isRead: true,
        metadata: { jobId: 'job4' }
      }
    ];
  }
  
  return baseNotifications;
};

export const notificationService = {
  getNotifications: (userRole: string): Notification[] => {
    return getDummyNotifications(userRole);
  },
  
  markAsRead: (notificationId: string, notifications: Notification[]): Notification[] => {
    return notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
  },
  
  removeNotification: (notificationId: string, notifications: Notification[]): Notification[] => {
    return notifications.filter(notification => notification.id !== notificationId);
  },
  
  getUnreadCount: (notifications: Notification[]): number => {
    return notifications.filter(notification => !notification.isRead).length;
  }
};
