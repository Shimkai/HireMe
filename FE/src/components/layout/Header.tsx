import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import { Notifications as NotificationsIcon, Menu as MenuIcon, Settings as SettingsIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDropdown from '../NotificationDropdown';
import ProfileAvatar from '../common/ProfileAvatar';
import ErrorBoundary from '../common/ErrorBoundary';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, isConnected, connectionStatus } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  // Debug: Monitor unread count changes
  useEffect(() => {
    console.log('Header: Unread count changed:', unreadCount);
  }, [unreadCount]);


  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationUpdate = () => {
    // The notification count is now managed by the useNotifications hook
    // No need to manually update it here
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          HireMe
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Tooltip title={'Notifications'}>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationClick}
            >
              <Badge 
                badgeContent={unreadCount || 0} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    animation: (unreadCount || 0) > 0 ? 'pulse 2s infinite' : 'none',
                    backgroundColor: '#f44336',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.55rem',
                    minWidth: '12px',
                    height: '12px',
                    borderRadius: '6px',
                    top: '-2px',
                    right: '-2px',
                    transform: 'scale(1)',
                    padding: '0',
                    lineHeight: '12px',
                    border: '1px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          {/* Connection status icon removed per requirements */}
        </Box>

        <Chip label={user?.role} color="secondary" size="small" sx={{ mr: 2 }} />

        <IconButton onClick={handleMenu} sx={{ p: 0 }}>
          <ProfileAvatar
            key={`avatar-${user?.profileAvatar || 'default'}-${user?._id}`}
            user={user}
            alt={user?.fullName}
            sx={{ 
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
            }}
          />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleProfile}>
            <SettingsIcon sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>

        <ErrorBoundary
          fallback={
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="error">
                Notifications unavailable
              </Typography>
            </Box>
          }
        >
          <NotificationDropdown
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            onNotificationUpdate={handleNotificationUpdate}
          />
        </ErrorBoundary>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

