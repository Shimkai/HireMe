import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import {
  Dashboard,
  Work,
  Assignment,
  People,
  Description,
  CheckCircle,
  Analytics,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 250;

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const studentMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Browse Jobs', icon: <Work />, path: '/jobs' },
    { text: 'My Applications', icon: <Assignment />, path: '/applications' },
    { text: 'Resume', icon: <Description />, path: '/resume' },
  ];

  const recruiterMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Post Job', icon: <Work />, path: '/jobs/new' },
    { text: 'My Jobs', icon: <Work />, path: '/jobs' },
    { text: 'Applicants', icon: <People />, path: '/applicants' },
  ];

  const tnpMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Manage Students', icon: <People />, path: '/students' },
    { text: 'Approve Jobs', icon: <CheckCircle />, path: '/jobs/pending' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
  ];

  const getMenuItems = () => {
    if (user?.role === 'Student') return studentMenuItems;
    if (user?.role === 'Recruiter') return recruiterMenuItems;
    if (user?.role === 'TnP') return tnpMenuItems;
    return [];
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        {getMenuItems().map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

