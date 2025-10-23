import { useAuth } from '../hooks/useAuth';
import StudentDashboard from './student/Dashboard'; // Back to full version
import RecruiterDashboard from './recruiter/Dashboard';
import TnPDashboard from './tnp/Dashboard';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('Dashboard - isAuthenticated:', isAuthenticated);
  console.log('Dashboard - user:', user);
  console.log('Dashboard - user role:', user?.role);

  // Handle case where user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Typography variant="h5" gutterBottom>
          Not Authenticated
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Please log in to access the dashboard.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  // Handle case where user role is invalid
  if (!user.role || !['Student', 'Recruiter', 'TnP'].includes(user.role)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Typography variant="h5" gutterBottom>
          Invalid User Role
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Your account has an invalid role. Please contact support.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'Student':
      return <StudentDashboard />;
    case 'Recruiter':
      return <RecruiterDashboard />;
    case 'TnP':
      return <TnPDashboard />;
    default:
      return <StudentDashboard />; // Fallback to student dashboard
  }
};

export default Dashboard;
