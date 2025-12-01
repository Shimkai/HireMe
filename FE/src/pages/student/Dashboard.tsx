import { Container, Grid, Card, CardContent, Typography, Button, Box, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, CircularProgress } from '@mui/material';
import { Work, Assignment, Event, CheckCircle, VerifiedUser, Warning, CardGiftcard } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import Recommendations from '../../components/jobs/Recommendations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [stats, setStats] = useState([
    { title: 'Applications Sent', value: '0', icon: <Assignment fontSize="large" />, color: '#8B5CF6' },
    { title: 'Interviews Scheduled', value: '0', icon: <Event fontSize="large" />, color: '#10B981' },
    { title: 'Shortlisted', value: '0', icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
    { title: 'Offers Received', value: '0', icon: <CardGiftcard fontSize="large" />, color: '#EF4444' },
  ]);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('StudentDashboard - user:', user);
  console.log('StudentDashboard - user role:', user?.role);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/analytics/dashboard');
        const data = response.data.data;
        
        setStats([
          { title: 'Applications Sent', value: (data.applicationsCount || 0).toString(), icon: <Assignment fontSize="large" />, color: '#8B5CF6' },
          { title: 'Interviews Scheduled', value: (data.interviewScheduled || 0).toString(), icon: <Event fontSize="large" />, color: '#10B981' },
          { title: 'Shortlisted', value: (data.shortlisted || 0).toString(), icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
          { title: 'Offers Received', value: (data.accepted || 0).toString(), icon: <CardGiftcard fontSize="large" />, color: '#EF4444' },
        ]);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Student') {
      fetchStatistics();
    }
  }, [user]);

  // Show verification popup if student is not verified
  useEffect(() => {
    if (user?.role === 'Student' && !user?.studentDetails?.isVerified) {
      setShowVerificationPopup(true);
      setCountdown(30);
    }
  }, [user]);

  // Countdown timer for the popup
  useEffect(() => {
    if (showVerificationPopup && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowVerificationPopup(false);
    }
  }, [showVerificationPopup, countdown]);

  const isVerified = user?.studentDetails?.isVerified;

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Student Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Welcome back! Here's your placement activity overview.
            </Typography>
          </Box>
          <Chip
            icon={isVerified ? <VerifiedUser /> : <Warning />}
            label={isVerified ? 'Verified Account' : 'Not Verified'}
            color={isVerified ? 'success' : 'warning'}
            size="medium"
            sx={{ fontSize: '1rem', py: 2 }}
          />
        </Box>

        {!isVerified && (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
            <Typography variant="body1" fontWeight="bold">
              Account Not Verified
            </Typography>
            <Typography variant="body2">
              Your account is not verified by the Training & Placement Officer. You cannot apply for jobs until your account is verified. Please contact your TnP office for verification.
            </Typography>
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: stat.color, mr: 2 }}>{stat.icon}</Box>
                      <Typography variant="h4" color={stat.color}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/resume')}>
                Update Resume
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/applications')}>
                View Applications
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* AI-Powered Job Recommendations */}
        <Recommendations limit={6} />

        <Card sx={{ mt: 4, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎓 Complete Your Profile
            </Typography>
            <Typography variant="body2">
              Ensure your profile is complete to apply for jobs. Update your resume and academic details.
            </Typography>
          </CardContent>
        </Card>

        {/* Verification Warning Popup */}
        <Dialog
          open={showVerificationPopup}
          onClose={() => setShowVerificationPopup(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Account Verification Required
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText component="div">
              <Typography variant="body1" gutterBottom fontWeight="bold" color="text.primary">
                Your account is not verified!
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                You need to get your account verified by your Training & Placement Officer to apply for jobs.
              </Typography>
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Steps to get verified:</strong>
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2, mt: 1 }}>
                  <li>Complete your profile with all academic details</li>
                  <li>Upload required documents (10th/12th marksheets)</li>
                  <li>Contact your TnP office for verification</li>
                </Typography>
              </Alert>
              <Typography variant="body2" color="error" fontWeight="bold">
                Until verified, you cannot apply for any jobs.
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2, textAlign: 'center' }}>
                This message will close in {countdown} seconds
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate('/profile')} color="primary" variant="contained">
              Go to Profile
            </Button>
            <Button onClick={() => setShowVerificationPopup(false)} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default StudentDashboard;

