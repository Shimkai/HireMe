import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import {
  Dashboard,
  Work,
  Assignment,
  People,
  CheckCircle,
  Analytics,
  Assessment,
  Person,
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
<<<<<<< HEAD
    { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
    { text: 'Browse Jobs', icon: <Work />, path: '/student/jobs' },
    { text: 'My Applications', icon: <Assignment />, path: '/student/applications' },
    { text: 'Profile', icon: <People />, path: '/student/profile' },
  ];

  const recruiterMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/recruiter/dashboard' },
    { text: 'Post Job', icon: <Work />, path: '/recruiter/post-job' },
    { text: 'Manage Jobs', icon: <Work />, path: '/recruiter/jobs' },
    { text: 'Manage Applicants', icon: <People />, path: '/recruiter/applicants' },
    { text: 'Profile', icon: <People />, path: '/recruiter/profile' },
  ];

  const tnpMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/tnp/dashboard' },
    { text: 'Manage Students', icon: <People />, path: '/tnp/students' },
    { text: 'Approve Jobs', icon: <CheckCircle />, path: '/tnp/jobs/pending' },
    { text: 'View Applicants', icon: <Assignment />, path: '/tnp/applicants' },
    { text: 'Reports', icon: <Analytics />, path: '/tnp/reports' },
    { text: 'Profile', icon: <People />, path: '/tnp/profile' },
=======
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'My Profile', icon: <Person />, path: '/profile' },
    { text: 'Browse Jobs', icon: <Work />, path: '/jobs' },
    { text: 'My Applications', icon: <Assignment />, path: '/applications' },
    { text: 'Resume', icon: <Description />, path: '/resume' },
  ];

  const recruiterMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'My Profile', icon: <Person />, path: '/profile' },
    { text: 'Post Job', icon: <Work />, path: '/jobs/new' },
    { text: 'My Jobs', icon: <Work />, path: '/jobs' },
    { text: 'Applicants', icon: <People />, path: '/applicants' },
  ];

  const tnpMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'My Profile', icon: <Person />, path: '/profile' },
    { text: 'Manage Students', icon: <People />, path: '/students' },
    { text: 'Approve Jobs', icon: <CheckCircle />, path: '/jobs/pending' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Report', icon: <Assessment />, path: '/report' },
>>>>>>> 9b124f5 (report and student recommendation)
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

