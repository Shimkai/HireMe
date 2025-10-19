import { Container, Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { People, Work, Analytics, CheckCircle } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';

const TnPDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Students', value: '0', icon: <People fontSize="large" />, color: '#A78BFA' },
    { title: 'Active Jobs', value: '0', icon: <Work fontSize="large" />, color: '#10B981' },
    { title: 'Pending Approvals', value: '0', icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
    { title: 'Placement Rate', value: '0%', icon: <Analytics fontSize="large" />, color: '#EF4444' },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Training & Placement Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Welcome back! Manage students, approve jobs, and track placement activities.
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
              <Button variant="contained" onClick={() => navigate('/students')}>
                Manage Students
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/jobs/pending')}>
                Approve Jobs
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/analytics')}>
                View Analytics
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Card sx={{ mt: 4, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Placement Management
            </Typography>
            <Typography variant="body2">
              Monitor student progress, approve job postings, and track placement statistics to ensure successful career outcomes.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default TnPDashboard;
