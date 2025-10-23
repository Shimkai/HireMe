import { Notification } from '../types/notification';
import api from '../utils/api';

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationService = {
  // Get notifications with pagination and filtering
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }): Promise<NotificationResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    if (params?.priority) queryParams.append('priority', params.priority);

    const response = await api.get(`/notifications?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get unread count for badge
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    console.log('NotificationService: Unread count response:', response.data);
    return response.data.data.unreadCount;
  },

  // Mark specific notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data.data;
  },

  // Delete specific notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get notification statistics
  getStats: async () => {
    const response = await api.get('/notifications/stats');
    return response.data.data;
  }
};
