import { Container, Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Work, Assignment, Event, CheckCircle } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Applications Sent', value: '0', icon: <Assignment fontSize="large" />, color: '#A78BFA' },
    { title: 'Interviews Scheduled', value: '0', icon: <Event fontSize="large" />, color: '#10B981' },
    { title: 'Shortlisted', value: '0', icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
    { title: 'Job Alerts', value: '0', icon: <Work fontSize="large" />, color: '#EF4444' },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Student Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Welcome back! Here's your placement activity overview.
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
      </Container>
    </MainLayout>
  );
};

export default StudentDashboard;

