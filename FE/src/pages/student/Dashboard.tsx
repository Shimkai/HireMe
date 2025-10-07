import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/cards/StatCard';
import {
  Work,
  TrendingUp,
  CheckCircle,
  Close,
  Person,
  School,
  CheckCircleOutline,
} from '@mui/icons-material';
import { applicationService, Application } from '../../services/applicationService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    shortlisted: 0,
    accepted: 0,
  });
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [popupProgress, setPopupProgress] = useState(100);

  useEffect(() => {
    fetchDashboardData();
    checkFirstTimeLogin();
  }, []);

  // Refresh data when user returns to the dashboard (window focus)
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const checkFirstTimeLogin = () => {
    // Check if this is a first-time login for a student
    if (user?.role === 'Student') {
      // Check if user was created recently (within last 10 minutes) - this indicates a new registration
      const userCreatedAt = new Date(user.createdAt);
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isRecentlyRegistered = timeDiff < 10 * 60 * 1000; // 10 minutes
      
      // Also check if student profile is incomplete (indicates first time)
      const isProfileIncomplete = !user.studentDetails?.cgpa || 
                                 !user.studentDetails?.yearOfCompletion ||
                                 !user.studentDetails?.courseName;
      
      // Show popup for recently registered students or those with incomplete profiles
      if (isRecentlyRegistered || isProfileIncomplete) {
        setShowWelcomePopup(true);
        startPopupTimer();
      }
    }
  };

  const startPopupTimer = () => {
    const duration = 20000; // 20 seconds
    const interval = 100; // Update every 100ms
    const decrement = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setPopupProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(timer);
          setShowWelcomePopup(false);
          return 0;
        }
        return newProgress;
      });
    }, interval);
  };

  const handleClosePopup = () => {
    setShowWelcomePopup(false);
    setPopupProgress(0);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications({ limit: 5 });
      console.log('Applications response:', response.data); // Debug log
      
      // Filter out applications with null jobId to prevent errors
      const validApplications = response.data.filter(app => app.jobId && typeof app.jobId === 'object');
      console.log('Valid applications:', validApplications); // Debug log
      
      setApplications(validApplications);
      
      // Calculate stats
      const totalApps = response.pagination?.total || 0;
      const shortlisted = validApplications.filter(app => app.status === 'Shortlisted').length;
      const accepted = validApplications.filter(app => app.status === 'Accepted' || app.status === 'Offered').length;
      
      setStats({
        totalApplications: totalApps,
        shortlisted,
        accepted,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const isVerified = user?.studentDetails?.isVerified;
  const isPlaced = user?.studentDetails?.placementStatus === 'Placed';

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your job applications
      </Typography>

      {/* Verification Alert */}
      {!isVerified && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Account Verification Required:</strong> Your account is currently unverified. 
            This may be because you recently updated your profile information. 
            Please contact your TnP officer to get verified again. You need to be verified to apply for jobs.
          </Typography>
        </Alert>
      )}

      {/* Placement Status */}
      {isPlaced && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Congratulations!</strong> You have been placed. You can still view your application history.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Applications Sent"
            value={stats.totalApplications}
            icon={<Work />}
            color="primary"
            subtitle="Total applications"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={<TrendingUp />}
            color="warning"
            subtitle="Under consideration"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Accepted/Offered"
            value={stats.accepted}
            icon={<CheckCircle />}
            color="success"
            subtitle="Job offers & acceptances"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Applications
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading your applications...
              </Typography>
            ) : applications.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You haven't applied to any jobs yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.href = '/student/jobs'}
                  disabled={!isVerified || isPlaced}
                >
                  Browse Jobs
                </Button>
              </Box>
            ) : (
              <Box>
                {applications.slice(0, 3).map((application) => (
                  <Box key={application._id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {application.jobId?.title || 'Job Title Not Available'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {application.jobId?.companyName || 'Company Not Available'} • {application.jobId?.location || 'Location Not Available'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()} • 
                      Status: {application.status}
                    </Typography>
                  </Box>
                ))}
                {applications.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => window.location.href = '/student/applications'}
                    sx={{ mt: 1 }}
                  >
                    View All Applications ({stats.totalApplications})
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => window.location.href = '/student/jobs'}
                disabled={!isVerified || isPlaced}
              >
                Browse Jobs
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => window.location.href = '/student/applications'}
              >
                View Applications
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => window.location.href = '/student/profile'}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Welcome Popup for First-Time Students */}
      <Dialog
        open={showWelcomePopup}
        onClose={handleClosePopup}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
          color: 'white'
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <School />
            <Typography variant="h6" component="div">
              Welcome to HireMe! 🎉
            </Typography>
          </Box>
          <IconButton
            onClick={handleClosePopup}
            sx={{ color: 'white' }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Welcome to HireMe! 🎉 You've successfully registered your account. 
            To get started and apply for jobs, you need to complete these important steps:
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Person color="primary" />
              <Typography variant="body2">
                <strong>1. Complete Your Profile</strong> - Fill in all your personal and academic details
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <CheckCircleOutline color="primary" />
              <Typography variant="body2">
                <strong>2. Get Verified by TnP</strong> - Contact your Training & Placement officer for verification
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Work color="primary" />
              <Typography variant="body2">
                <strong>3. Start Applying</strong> - Once verified, you can apply to available job opportunities
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Quick Tip:</strong> Complete your profile with accurate information to increase your chances of getting hired. 
              You can access your profile anytime from the sidebar menu!
            </Typography>
          </Alert>

          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              This popup will close automatically in {Math.ceil(popupProgress / 5)} seconds
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={popupProgress} 
              sx={{ 
                mt: 1,
                height: 4,
                borderRadius: 2,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #A78BFA 0%, #7C3AED 100%)'
                }
              }} 
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleClosePopup} 
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Got it!
          </Button>
          <Button 
            onClick={() => {
              handleClosePopup();
              window.location.href = '/student/profile';
            }} 
            variant="contained"
            startIcon={<Person />}
            sx={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
              }
            }}
          >
            Complete Profile Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;