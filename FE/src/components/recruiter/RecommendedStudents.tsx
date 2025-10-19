import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import studentRecommendationService, {
  StudentRecommendation,
  RecommendationStats,
} from '../../services/studentRecommendationService';

interface RecommendedStudentsProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

const RecommendedStudents: React.FC<RecommendedStudentsProps> = ({ jobId, open, onClose }) => {
  const [recommendations, setRecommendations] = useState<StudentRecommendation[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && jobId) {
      fetchRecommendations();
      fetchStats();
    }
  }, [open, jobId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentRecommendationService.getRecommendedStudents(jobId, {
        limit: 10,
        minScore: 0,
      });
      setRecommendations(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await studentRecommendationService.getRecommendationStats(jobId);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#2196f3';
    if (percentage >= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">Recommended Students</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Statistics Cards */}
            {stats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="textSecondary">
                        Total Matches
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.totalRecommendations}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="textSecondary">
                        Average Score
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.averageScore.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="textSecondary">
                        Top Score
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.topScore.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="textSecondary">
                        Excellent Matches
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.skillMatchDistribution.excellent}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {recommendations.length === 0 ? (
              <Alert severity="info">
                No students found matching the job requirements. Try adjusting the eligibility criteria.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>CGPA</TableCell>
                      <TableCell>Skill Match</TableCell>
                      <TableCell>Overall Score</TableCell>
                      <TableCell>Matching Skills</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.map((rec, index) => (
                      <TableRow key={rec.student._id} hover>
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color={index < 3 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={rec.student.profileAvatar}
                              alt={rec.student.fullName}
                              sx={{ width: 32, height: 32 }}
                            >
                              {rec.student.fullName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {rec.student.fullName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {rec.student.registrationNumber || rec.student.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <SchoolIcon fontSize="small" color="action" />
                            <Typography variant="body2">{rec.student.branch || 'N/A'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={rec.student.cgpa?.toFixed(2) || 'N/A'}
                            size="small"
                            color={rec.meetsRequirements.cgpa ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" fontWeight="medium">
                                {rec.skillMatch.matchPercentage.toFixed(0)}%
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {rec.skillMatch.matchingSkills.length} skills
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={rec.skillMatch.matchPercentage}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getMatchColor(rec.skillMatch.matchPercentage),
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${rec.score.toFixed(1)}%`}
                            color={getScoreColor(rec.score) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.5} maxWidth={200}>
                            {rec.skillMatch.matchingSkills.slice(0, 3).map((skill) => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                icon={<CodeIcon fontSize="small" />}
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                            {rec.skillMatch.matchingSkills.length > 3 && (
                              <Chip
                                label={`+${rec.skillMatch.matchingSkills.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                // Navigate to student profile or open modal
                                window.open(`/profile/${rec.student._id}`, '_blank');
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecommendedStudents;

