import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, LinearProgress, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, Cancel, CheckCircle, Business, LocationOn, Work } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await applicationService.getMyApplications();
      console.log('Applications response:', response);
      setApplications(response.data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = (application: Application) => {
    setSelectedApplication(application);
    setWithdrawDialog(true);
  };

  const confirmWithdraw = async () => {
    if (!selectedApplication) return;

    try {
      setProcessing(true);
      await applicationService.withdrawApplication(selectedApplication._id);
      setWithdrawDialog(false);
      setSelectedApplication(null);
      // Refresh applications
      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to withdraw application');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseWithdrawDialog = () => {
    setWithdrawDialog(false);
    setSelectedApplication(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'default';
      case 'Under Review': return 'info';
      case 'Shortlisted': return 'primary';
      case 'Interview Scheduled': return 'warning';
      case 'Accepted': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'success';
      case 'Rejected': return 'error';
      case 'Interview Scheduled': return 'warning';
      case 'Shortlisted': return 'primary';
      default: return 'primary';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'Applied': return 20;
      case 'Under Review': return 40;
      case 'Shortlisted': return 60;
      case 'Interview Scheduled': return 80;
      case 'Accepted': return 100;
      case 'Rejected': return 100;
      default: return 20;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getJobTitle = (application: Application) => {
    console.log('Getting job title for application:', application);
    if (!application || !application.jobId) return 'Unknown Job';
    if (typeof application.jobId === 'object' && application.jobId !== null) {
      return (application.jobId as any).title || 'Unknown Job';
    }
    return 'Unknown Job';
  };

  const getCompanyName = (application: Application) => {
    if (!application || !application.jobId) return 'Unknown Company';
    if (typeof application.jobId === 'object' && application.jobId !== null) {
      return (application.jobId as any).companyName || 'Unknown Company';
    }
    return 'Unknown Company';
  };

  const getLocation = (application: Application) => {
    if (!application || !application.jobId) return 'Unknown Location';
    if (typeof application.jobId === 'object' && application.jobId !== null) {
      return (application.jobId as any).location || 'Unknown Location';
    }
    return 'Unknown Location';
  };

  const getCTC = (application: Application) => {
    if (!application || !application.jobId) return 'Not specified';
    if (typeof application.jobId === 'object' && application.jobId !== null) {
      const job = application.jobId as any;
      if (job.ctc) {
        return `${job.ctc.min}-${job.ctc.max} ${job.ctc.currency}`;
      }
    }
    return 'Not specified';
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            My Applications
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track your job applications
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (

          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {applications.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Applications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {applications.filter(app => app.status === 'Accepted').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Accepted
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {applications.filter(app => app.status === 'Interview Scheduled').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Interviews
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main">
                      {applications.filter(app => app.status === 'Under Review').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Under Review
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>CTC</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          No applications yet
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                          Start applying to jobs to see your applications here.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => window.location.href = '/jobs'}
                          startIcon={<Work />}
                        >
                          Browse Jobs
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Work sx={{ mr: 1, color: 'primary.main' }} />
                            {getJobTitle(application)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Business sx={{ mr: 1, color: 'primary.main' }} />
                            {getCompanyName(application)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                            {getLocation(application)}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(application.appliedAt)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={application.status} 
                            color={getStatusColor(application.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={getProgressValue(application.status)}
                                color={getProgressColor(application.status) as any}
                              />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {getProgressValue(application.status)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            {getCTC(application)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" title="View Details">
                            <Visibility />
                          </IconButton>
                          {(application.status === 'Applied' || application.status === 'Under Review') && (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleWithdraw(application)}
                              title="Withdraw Application"
                            >
                              <Cancel />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Applications
                </Typography>
                <Grid container spacing={2}>
                  {applications.slice(0, 3).map((application) => (
                    <Grid item xs={12} md={4} key={application._id}>
                      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {getJobTitle(application)} - {getCompanyName(application)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Applied: {formatDate(application.appliedAt)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={getProgressValue(application.status)}
                              color={getProgressColor(application.status) as any}
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {getProgressValue(application.status)}%
                          </Typography>
                        </Box>
                        <Chip 
                          label={application.status} 
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* Withdraw Application Dialog */}
        <Dialog open={withdrawDialog} onClose={handleCloseWithdrawDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Withdraw Application</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <>
                <Typography sx={{ mb: 2 }}>
                  Are you sure you want to withdraw your application for "{getJobTitle(selectedApplication)}" at {getCompanyName(selectedApplication)}?
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  This action cannot be undone. You will need to reapply if you change your mind.
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWithdrawDialog} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmWithdraw} 
              variant="contained" 
              color="error"
              disabled={processing || !selectedApplication}
            >
              {processing ? <CircularProgress size={20} /> : 'Withdraw Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default ApplicationsPage;
