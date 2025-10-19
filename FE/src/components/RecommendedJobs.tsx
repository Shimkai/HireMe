import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { recommendationService, JobRecommendation } from '../services/recommendationService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface RecommendedJobsProps {
  limit?: number;
  showTitle?: boolean;
  onJobClick?: (job: JobRecommendation['job']) => void;
}

const RecommendedJobs: React.FC<RecommendedJobsProps> = ({
  limit = 6,
  showTitle = true,
  onJobClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recommendationService.getMyRecommendations(limit);
        setRecommendations(data);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.response?.data?.error?.message || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Student') {
      fetchRecommendations();
    }
  }, [limit, user?.role]);

  const formatSalary = (ctc: { min: number; max: number; currency: string }) => {
    return `₹${ctc.min}-${ctc.max} ${ctc.currency || 'LPA'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const handleQuickApply = (job: JobRecommendation['job']) => {
    // Check if student is verified
    if (!user?.studentDetails?.isVerified) {
      setVerificationDialogOpen(true);
      return;
    }
    
    // If verified, proceed with normal application flow
    onJobClick?.(job);
  };

  if (user?.role !== 'Student') {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        {showTitle && (
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Recommended Jobs
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 3 }}>
        {showTitle && (
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Recommended Jobs
          </Typography>
        )}
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        {showTitle && (
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Recommended Jobs
          </Typography>
        )}
        <Alert severity="info">
          No job recommendations available. Complete your profile with skills and preferences to get personalized recommendations.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {showTitle && (
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          Recommended Jobs
        </Typography>
      )}
      
      <Grid container spacing={2}>
        {recommendations.map((recommendation) => (
          <Grid item xs={12} md={6} lg={4} key={recommendation.job._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Match Score - Keep this as it's unique to recommendations */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Match Score
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={`${getMatchColor(recommendation.matchPercentage)}.main`}
                      fontWeight="bold"
                    >
                      {recommendation.matchPercentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={recommendation.matchPercentage}
                    color={getMatchColor(recommendation.matchPercentage) as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {/* Job Title */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {recommendation.job.title}
                </Typography>

                {/* Company */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {recommendation.job.companyName}
                  </Typography>
                </Box>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {recommendation.job.location}
                  </Typography>
                </Box>

                {/* Job Type */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {recommendation.job.jobType}
                  </Typography>
                </Box>

                {/* Salary */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {formatSalary(recommendation.job.ctc)}
                  </Typography>
                </Box>

                {/* Skills Preview - Only first 3 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                    Skills:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {recommendation.job.skillsRequired.slice(0, 3).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                    {recommendation.job.skillsRequired.length > 3 && (
                      <Chip
                        label={`+${recommendation.job.skillsRequired.length - 3} more`}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>

              {/* Action Buttons */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/jobs/${recommendation.job._id}`)}
                  sx={{ mb: 1 }}
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<WorkIcon />}
                  onClick={() => handleQuickApply(recommendation.job)}
                >
                  Quick Apply
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Verification Required Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Account Verification Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You need to get your account verified by your Training & Placement Officer before you can apply for jobs.
          </DialogContentText>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>To get verified:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              1. Complete your profile with all required information<br/>
              2. Contact your TnP office for verification<br/>
              3. Wait for verification approval
            </Typography>
          </Alert>
          <Typography variant="body2" color="textSecondary">
            Once verified, you'll be able to apply for jobs and access all placement features.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setVerificationDialogOpen(false);
              navigate('/profile');
            }}
          >
            Complete Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecommendedJobs;
