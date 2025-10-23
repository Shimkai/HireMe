import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import socketService from '../../services/socketService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    type?: string;
    isRead?: boolean;
    priority?: string;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: { page?: number; limit?: number; type?: string; isRead?: boolean; priority?: string }) => {
    const response = await notificationService.getNotifications(params);
    return response;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    const count = await notificationService.getUnreadCount();
    return count;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    const notification = await notificationService.markAsRead(notificationId);
    return notification;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const result = await notificationService.markAllAsRead();
    return result;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ type?: string; isRead?: boolean; priority?: string }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Check if notification already exists
      const exists = state.notifications.some(n => (n.id || n._id) === (action.payload.id || action.payload._id));
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
        state.pagination.total += 1;
      }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      // Keep only last 50 notifications to prevent memory issues
      state.notifications = action.payload.slice(0, 50);
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => (n.id || n._id) === (action.payload.id || action.payload._id));
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        const isNowRead = action.payload.isRead;
        
        state.notifications[index] = action.payload;
        
        // Update unread count
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => (n.id || n._id) === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications.splice(index, 1);
        state.pagination.total -= 1;
        
        // Update unread count
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        console.log('Redux: Setting unread count to:', action.payload);
        state.unreadCount = action.payload;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => (n.id || n._id) === (action.payload.id || action.payload._id));
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications[index] = action.payload;
          
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => (n.id || n._id) === action.payload);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications.splice(index, 1);
          state.pagination.total -= 1;
          
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  addNotification,
  setNotifications,
  updateNotification,
  removeNotification,
  updateUnreadCount,
  clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
