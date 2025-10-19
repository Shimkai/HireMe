import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  Badge,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role) {
      const userNotifications = notificationService.getNotifications(user.role);
      setNotifications(userNotifications);
      setUnreadCount(notificationService.getUnreadCount(userNotifications));
    }
  }, [user?.role]);

  const handleMarkAsRead = (notificationId: string) => {
    const updatedNotifications = notificationService.markAsRead(notificationId, notifications);
    setNotifications(updatedNotifications);
    setUnreadCount(notificationService.getUnreadCount(updatedNotifications));
    onNotificationUpdate?.();
  };

  const handleRemoveNotification = (notificationId: string) => {
    const updatedNotifications = notificationService.removeNotification(notificationId, notifications);
    setNotifications(updatedNotifications);
    setUnreadCount(notificationService.getUnreadCount(updatedNotifications));
    onNotificationUpdate?.();
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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
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

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {getRoleBasedTitle()}
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isRead ? 'none' : `4px solid ${getPriorityColor(notification.priority)}`,
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
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {!notification.isRead && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ mb: 1 }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Remove notification">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveNotification(notification.id)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
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
          </Typography>
        </Box>
      )}
    </Menu>
  );
};

export default NotificationDropdown;
