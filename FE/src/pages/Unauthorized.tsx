import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, ArrowBack } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      switch (user.role) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Recruiter':
          navigate('/recruiter/dashboard');
          break;
        case 'TnP':
          navigate('/tnp/dashboard');
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box textAlign="center">
        <Typography variant="h1" color="error" sx={{ fontSize: '4rem', mb: 2 }}>
          403
        </Typography>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Unauthorized;
