<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/cards/StatCard';
import {
  Work,
  Assignment,
  People,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    hiredCandidates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recruiter's jobs
      const jobsResponse = await jobService.getAllJobs({ limit: 10 });
      const jobs = jobsResponse.data;
      
      // Calculate stats
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(job => job.status === 'Approved' && job.isActive).length;
      
      // Fetch applications for all jobs
      let totalApplications = 0;
      let shortlistedCandidates = 0;
      let hiredCandidates = 0;
      
      for (const job of jobs) {
        try {
          const applicationsResponse = await applicationService.getJobApplications(job._id);
          const applications = applicationsResponse.data;
          
          totalApplications += applications.length;
          shortlistedCandidates += applications.filter(app => app.status === 'Shortlisted').length;
          hiredCandidates += applications.filter(app => app.status === 'Offered' || app.status === 'Accepted').length;
        } catch (error) {
          console.error(`Failed to fetch applications for job ${job._id}:`, error);
        }
      }
      
      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        shortlistedCandidates,
        hiredCandidates,
      });
      
      setRecentJobs(jobs.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recruiters are always verified - no verification needed
  const isVerified = true;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's your recruitment activity overview
      </Typography>


      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Jobs Posted"
            value={stats.totalJobs}
            icon={<Work />}
            color="primary"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<CheckCircle />}
            color="success"
            subtitle="Currently live"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={<Assignment />}
            color="info"
            subtitle="All applications"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shortlisted"
            value={stats.shortlistedCandidates}
            icon={<People />}
            color="primary"
            subtitle="Candidates"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Placed"
            value={stats.hiredCandidates}
            icon={<TrendingUp />}
            color="success"
            subtitle="Offered positions"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Job Postings
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading your job postings...
              </Typography>
            ) : recentJobs.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You haven't posted any jobs yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.href = '/recruiter/post-job'}
                >
                  Post Your First Job
                </Button>
              </Box>
            ) : (
              <Box>
                {recentJobs.map((job) => (
                  <Box key={job._id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {job.companyName} • {job.location} • {job.jobType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Posted: {new Date(job.createdAt).toLocaleDateString()} • 
                      Status: {job.status} • 
                      Applications: {job.applicationCount}
                    </Typography>
                  </Box>
                ))}
                {recentJobs.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => window.location.href = '/recruiter/jobs'}
                    sx={{ mt: 1 }}
                  >
                    View All Jobs ({stats.totalJobs})
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
                onClick={() => window.location.href = '/recruiter/post-job'}
              >
                Post New Job
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => window.location.href = '/recruiter/jobs'}
              >
                Manage Jobs
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => window.location.href = '/recruiter/applicants'}
              >
                Manage Applicants
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => window.location.href = '/recruiter/profile'}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Company Information */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Company Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Company:</strong> {user?.recruiterDetails?.companyName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Industry:</strong> {user?.recruiterDetails?.industry}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Designation:</strong> {user?.recruiterDetails?.designation}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Verification Status:</strong> Verified
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
=======
import { Container, Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Work, People, Analytics, CheckCircle } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Active Jobs', value: '0', icon: <Work fontSize="large" />, color: '#A78BFA' },
    { title: 'Total Applications', value: '0', icon: <People fontSize="large" />, color: '#10B981' },
    { title: 'Interviews Scheduled', value: '0', icon: <CheckCircle fontSize="large" />, color: '#F59E0B' },
    { title: 'Hired Candidates', value: '0', icon: <Analytics fontSize="large" />, color: '#EF4444' },
  ];

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
>>>>>>> 9b124f5 (report and student recommendation)
