import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
  updateNotification,
  removeNotification,
  updateUnreadCount,
  setFilters,
  clearFilters,
} from '../features/notifications/notificationSlice';
import socketService from '../services/socketService';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    filters,
  } = useSelector((state: RootState) => state.notifications);

  // Initialize socket connection and fetch initial data
  useEffect(() => {
    // Try to connect to WebSocket (will gracefully fail if not available)
    try {
      socketService.connect();
    } catch (error) {
      console.warn('WebSocket connection failed, using polling only:', error);
    }

    // Fetch initial notifications and unread count
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());

    // Set up polling fallback with exponential backoff
    let pollInterval: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 30000; // 30 seconds

    const startPolling = () => {
      const poll = async () => {
        try {
          await dispatch(fetchUnreadCount()).unwrap();
          retryCount = 0; // Reset on success
          pollInterval = setTimeout(poll, baseDelay);
        } catch (error) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const delay = Math.min(baseDelay * Math.pow(2, retryCount), 300000); // Max 5 min
            console.warn(`Polling failed, retrying in ${delay/1000}s...`);
            pollInterval = setTimeout(poll, delay);
          } else {
            console.error('Max polling retries reached');
          }
        }
      };
      poll();
    };

    startPolling();

    // Setup socket event listeners
    const handleNewNotification = (notification: any) => {
      dispatch(addNotification(notification));
    };

    const handleNotificationCountUpdate = (data: { unreadCount: number }) => {
      dispatch(updateUnreadCount(data.unreadCount));
    };

    const handleNotificationReadSuccess = (data: { notificationId: string }) => {
      // Find and update the notification
      const notification = notifications.find(n => n.id === data.notificationId);
      if (notification) {
        dispatch(updateNotification({ ...notification, isRead: true }));
      }
    };

    const handleAllNotificationsReadSuccess = () => {
      dispatch(markAllAsRead());
    };

    // Add event listeners
    socketService.on('new_notification', handleNewNotification);
    socketService.on('notification_count_update', handleNotificationCountUpdate);
    socketService.on('notification_read_success', handleNotificationReadSuccess);
    socketService.on('all_notifications_read_success', handleAllNotificationsReadSuccess);

    // Cleanup on unmount
    return () => {
      socketService.off('new_notification', handleNewNotification);
      socketService.off('notification_count_update', handleNotificationCountUpdate);
      socketService.off('notification_read_success', handleNotificationReadSuccess);
      socketService.off('all_notifications_read_success', handleAllNotificationsReadSuccess);
      socketService.disconnect();
      if (pollInterval) {
        clearTimeout(pollInterval);
      }
    };
  }, [dispatch]);

  // Actions
  const loadNotifications = useCallback((params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }) => {
    dispatch(fetchNotifications(params));
  }, [dispatch]);

  const loadUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const markAsRead = useCallback((notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
    // Also emit socket event for real-time updates
    socketService.markNotificationAsRead(notificationId);
  }, [dispatch]);

  const markAllAsReadAction = useCallback(() => {
    dispatch(markAllAsRead());
    // Also emit socket event for real-time updates
    socketService.markAllNotificationsAsRead();
  }, [dispatch]);

  const remove = useCallback((notificationId: string) => {
    dispatch(deleteNotification(notificationId));
  }, [dispatch]);

  const setNotificationFilters = useCallback((newFilters: {
    type?: string;
    isRead?: boolean;
    priority?: string;
  }) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearNotificationFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Get filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    return true;
  });

  return {
    // State
    notifications: filteredNotifications,
    allNotifications: notifications,
    unreadCount,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead: markAllAsReadAction,
    removeNotification: remove,
    setFilters: setNotificationFilters,
    clearFilters: clearNotificationFilters,
    
    // Socket status
    isConnected: socketService.isConnected(),
    connectionStatus: socketService.getConnectionStatus(),
  };
};
