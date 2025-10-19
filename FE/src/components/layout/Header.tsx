import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { Notifications as NotificationsIcon, Menu as MenuIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../NotificationDropdown';
import { notificationService } from '../../services/notificationService';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role) {
      const notifications = notificationService.getNotifications(user.role);
      const count = notificationService.getUnreadCount(notifications);
      setUnreadCount(count);
    }
  }, [user?.role]);


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
    if (user?.role) {
      const notifications = notificationService.getNotifications(user.role);
      const count = notificationService.getUnreadCount(notifications);
      setUnreadCount(count);
    }
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

        <IconButton 
          color="inherit" 
          sx={{ mr: 2 }}
          onClick={handleNotificationClick}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Chip label={user?.role} color="secondary" size="small" sx={{ mr: 2 }} />

        <IconButton onClick={handleMenu} sx={{ p: 0 }}>
          <Avatar 
            key={user?.profileAvatar || 'default'}
            alt={user?.fullName} 
            src={user?.profileAvatar ? `http://localhost:5000${user.profileAvatar}` : undefined}
            sx={{ 
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
            }}
          >
            {user?.fullName?.charAt(0)}
          </Avatar>
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

        <NotificationDropdown
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          onNotificationUpdate={handleNotificationUpdate}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;

