import React, { useState, useEffect } from 'react';
import {
  Menu,
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  Fade,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onNotificationUpdate?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  open,
  onClose,
  onNotificationUpdate,
}) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loadNotifications,
    loadUnreadCount,
  } = useNotifications();

  // Load notifications when dropdown opens
  useEffect(() => {
    if (open) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [open, loadNotifications, loadUnreadCount]);

  // Remove automatic mark all as read when dropdown closes
  // Users should manually mark notifications as read

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      await markAllAsRead();
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle dropdown close with auto-mark as read
  const handleClose = () => {
    // Mark all unread notifications as read when dropdown closes
    if (unreadCount > 0) {
      handleMarkAllAsRead();
    }
    onClose();
  };

  const handleRemoveNotification = async (notificationId: string) => {
    try {
      await removeNotification(notificationId);
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const handleRefresh = () => {
    loadNotifications();
    loadUnreadCount();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = {
      sx: {
        fontSize: 20,
        color: priority === 'high' ? '#f44336' : priority === 'medium' ? '#ff9800' : '#4caf50'
      }
    };

    switch (type) {
      case 'job_posting':
        return <WorkIcon {...iconProps} />;
      case 'application_status':
        return <CheckCircleIcon {...iconProps} />;
      case 'job_approval':
        return <CheckCircleIcon {...iconProps} />;
      case 'job_rejection':
        return <WarningIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const formatTimestamp = (timestamp: Date | string | undefined) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case 'Student':
        return 'Your Notifications';
      case 'TnP':
        return 'Pending Approvals';
      case 'Recruiter':
        return 'Job Updates';
      default:
        return 'Notifications';
    }
  };

  // Connection status display removed per requirements

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 500,
          mt: 1,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
      TransitionComponent={Fade}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {getRoleBasedTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="error"
                sx={{ fontWeight: 600 }}
              />
            )}
            <Tooltip title="Refresh notifications">
              <span>
                <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Connection status indicators removed per requirements */}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ p: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Loading notifications...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
          <Button size="small" onClick={handleRefresh} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        </Box>
      )}

      {/* Notifications List */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {!loading && !error && notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id || notification._id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isRead ? '4px solid #ffc107' : '4px solid #f44336', // Yellow for read, red for unread
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {getNotificationIcon(notification.type, notification.priority)}
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 500 : 600,
                            color: 'text.primary',
                            mr: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.7rem',
                            backgroundColor: getPriorityColor(notification.priority),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatTimestamp((notification as any).createdAt || (notification as any).timestamp || '')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {!notification.isRead && (
                        <Tooltip title="Mark as read">
                          <span>
                            <IconButton
                              size="small"
                            onClick={() => handleMarkAsRead((notification as any).id || (notification as any)._id || '')}
                              sx={{ mb: 1 }}
                              disabled={false}
                            >
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Remove notification">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveNotification((notification as any).id || (notification as any)._id || '')}
                            sx={{ color: 'text.secondary' }}
                            disabled={false}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {notifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </Typography>
        </Box>
      )}
    </Menu>
  );
};

export default NotificationDropdown;