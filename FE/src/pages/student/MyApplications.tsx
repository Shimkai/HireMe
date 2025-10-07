import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Work,
  Schedule,
  LocationOn,
  AttachMoney,
  Visibility,
  Cancel,
  Download,
} from '@mui/icons-material';
import { applicationService, Application } from '../../services/applicationService';
import { format } from 'date-fns';

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: page.toString(),
        limit: '10',
      };
      if (statusFilter) params.status = statusFilter;

      const response = await applicationService.getMyApplications(params);
      console.log('Applications response:', response.data); // Debug log
      
      // Filter out applications with null jobId to prevent errors
      const validApplications = response.data.filter(app => app.jobId && typeof app.jobId === 'object');
      console.log('Valid applications:', validApplications); // Debug log
      
      setApplications(validApplications);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch applications');
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedApplication) return;

    try {
      await applicationService.withdrawApplication(selectedApplication._id);
      setWithdrawDialogOpen(false);
      setSelectedApplication(null);
      fetchApplications();
      alert('Application withdrawn successfully');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to withdraw application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'info';
      case 'Under Review':
        return 'warning';
      case 'Shortlisted':
        return 'success';
      case 'Interview Scheduled':
        return 'primary';
      case 'Accepted':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canWithdraw = (application: Application) => {
    return application.status === 'Applied' || application.status === 'Under Review';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Work sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          My Applications
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                label="Filter by Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Applied">Applied</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                <MenuItem value="Interview Scheduled">Interview Scheduled</MenuItem>
                <MenuItem value="Accepted">Accepted</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Applications */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You haven't applied to any jobs yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/student/jobs'}
          >
            Browse Jobs
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {applications.map((application) => (
              <Grid item xs={12} key={application._id}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box flexGrow={1}>
                        <Typography variant="h6" gutterBottom>
                          {application.jobId?.title || 'Job Title Not Available'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          {application.jobId?.companyName || 'Company Not Available'}
                        </Typography>
                      </Box>
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </Box>

                    <Stack spacing={1} mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{application.jobId?.location || 'Location Not Available'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Work fontSize="small" color="action" />
                        <Typography variant="body2">{application.jobId?.jobType || 'Job Type Not Available'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2">
                          {application.jobId?.ctc ? 
                            `${formatCurrency(application.jobId.ctc.min)} - ${formatCurrency(application.jobId.ctc.max)}` : 
                            'Salary Not Available'
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2">
                          Applied: {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Interview Details */}
                    {application.interviewDetails && (
                      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Interview Scheduled
                        </Typography>
                        <Stack spacing={1}>
                          {application.interviewDetails.scheduledDate && (
                            <Typography variant="body2">
                              Date: {format(new Date(application.interviewDetails.scheduledDate), 'MMM dd, yyyy')}
                            </Typography>
                          )}
                          {application.interviewDetails.scheduledTime && (
                            <Typography variant="body2">
                              Time: {application.interviewDetails.scheduledTime}
                            </Typography>
                          )}
                          {application.interviewDetails.interviewMode && (
                            <Typography variant="body2">
                              Mode: {application.interviewDetails.interviewMode}
                            </Typography>
                          )}
                          {application.interviewDetails.meetingLink && (
                            <Typography variant="body2">
                              Meeting Link: {application.interviewDetails.meetingLink}
                            </Typography>
                          )}
                          {application.interviewDetails.venue && (
                            <Typography variant="body2">
                              Venue: {application.interviewDetails.venue}
                            </Typography>
                          )}
                          {application.interviewDetails.instructions && (
                            <Typography variant="body2">
                              Instructions: {application.interviewDetails.instructions}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    )}

                    {/* Recruiter Notes */}
                    {application.recruiterNotes && (
                      <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recruiter Notes
                        </Typography>
                        <Typography variant="body2">
                          {application.recruiterNotes}
                        </Typography>
                      </Paper>
                    )}

                    {/* Rejection Reason */}
                    {application.rejectionReason && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Rejection Reason:
                        </Typography>
                        <Typography variant="body2">
                          {application.rejectionReason}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => window.location.href = `/student/jobs/${application.jobId._id}`}
                    >
                      View Job
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => {
                        // Download resume functionality
                        const link = document.createElement('a');
                        link.href = `/api/uploads/resumes/${application.resume.filename}`;
                        link.download = application.resume.originalName;
                        link.click();
                      }}
                    >
                      Download Resume
                    </Button>
                    {canWithdraw(application) && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setSelectedApplication(application);
                          setWithdrawDialogOpen(true);
                        }}
                      >
                        Withdraw
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Withdraw Confirmation Dialog */}
      <Dialog
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to withdraw your application for:
          </Typography>
          <Typography variant="h6" gutterBottom>
            {selectedApplication?.jobId.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            color="error"
            variant="contained"
          >
            Withdraw Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyApplications;
