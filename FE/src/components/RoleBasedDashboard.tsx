import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'Student':
          navigate('/student/dashboard', { replace: true });
          break;
        case 'Recruiter':
          navigate('/recruiter/dashboard', { replace: true });
          break;
        case 'TnP':
          navigate('/tnp/dashboard', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );
};

export default RoleBasedDashboard;
