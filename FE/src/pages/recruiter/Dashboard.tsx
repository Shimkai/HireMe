import { Container, Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Work, People, Analytics, CheckCircle } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Active Jobs', value: '0', icon: <Work fontSize="large" />, color: '#8B5CF6' },
    { title: 'Total Applications', value: '0', icon: <People fontSize="large" />, color: '#10B981' },
    { title: 'Interviews Scheduled', value: '0', icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
    { title: 'Hired Candidates', value: '0', icon: <Analytics fontSize="large" />, color: '#EF4444' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/users/recruiter/statistics');
        const data = response.data.data;
        
        setStats([
          { title: 'Active Jobs', value: data.activeJobs?.toString() || '0', icon: <Work fontSize="large" />, color: '#8B5CF6' },
          { title: 'Total Applications', value: data.totalApplications?.toString() || '0', icon: <People fontSize="large" />, color: '#10B981' },
          { title: 'Interviews Scheduled', value: data.interviewsScheduled?.toString() || '0', icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
          { title: 'Hired Candidates', value: data.hiredCandidates?.toString() || '0', icon: <Analytics fontSize="large" />, color: '#EF4444' },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Recruiter Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Welcome back! Manage your job postings and track applications.
        </Typography>

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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" onClick={() => navigate('/jobs/new')}>
                Post New Job
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/jobs')}>
                Manage Jobs
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/applicants')}>
                View Applicants
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Card sx={{ mt: 4, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💼 Complete Your Company Profile
            </Typography>
            <Typography variant="body2">
              Ensure your company profile is complete to attract the best candidates. Update your company information and verification status.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default RecruiterDashboard;
