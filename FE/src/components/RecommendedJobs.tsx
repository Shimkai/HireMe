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
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { recommendationService, JobRecommendation } from '../services/recommendationService';
import { useAuth } from '../hooks/useAuth';

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
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => onJobClick?.(recommendation.job)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Match Percentage */}
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
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Job Title */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {recommendation.job.title}
                </Typography>

                {/* Company */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {recommendation.job.companyName}
                  </Typography>
                </Box>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {recommendation.job.location}
                  </Typography>
                </Box>

                {/* Salary */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1, fontSize: 20, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {formatSalary(recommendation.job.ctc)}
                  </Typography>
                </Box>

                {/* Skills */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Required Skills:
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

                {/* Job Type & Work Mode */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={recommendation.job.jobType}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    label={recommendation.job.workMode}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>

                {/* Application Deadline */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    Apply by: {formatDate(recommendation.job.applicationDeadline)}
                  </Typography>
                </Box>

                {/* Match Reasons */}
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Why this matches:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {recommendation.reasons.slice(0, 2).map((reason, index) => (
                      <Tooltip key={index} title={reason}>
                        <Chip
                          label={reason.length > 30 ? `${reason.substring(0, 30)}...` : reason}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Tooltip>
                    ))}
                    {recommendation.reasons.length > 2 && (
                      <Chip
                        label={`+${recommendation.reasons.length - 2} more`}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendedJobs;
