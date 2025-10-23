import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../hooks/useAuth';

const StudentDashboardTest = () => {
  const { user } = useAuth();

  console.log('StudentDashboardTest - user:', user);
  console.log('StudentDashboardTest - user role:', user?.role);

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Student Dashboard Test
          </Typography>
          <Typography variant="body1" gutterBottom>
            This is a test version of the student dashboard.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            User: {user?.fullName || 'No user'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Role: {user?.role || 'No role'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Verified: {user?.studentDetails?.isVerified ? 'Yes' : 'No'}
          </Typography>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default StudentDashboardTest;
