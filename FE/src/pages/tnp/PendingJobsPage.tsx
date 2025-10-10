import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField } from '@mui/material';
import { CheckCircle, Cancel, Visibility, Business } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { Job } from '../../types';

const PendingJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs({ status: 'Pending' });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch pending jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (job: Job) => {
    setSelectedJob(job);
    setApprovalNotes('');
    setActionError('');
    setApproveDialog(true);
  };

  const handleReject = (job: Job) => {
    setSelectedJob(job);
    setRejectionReason('');
    setActionError('');
    setRejectDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedJob) return;

    try {
      setProcessing(true);
      setActionError('');
      
      await jobService.approveJob(selectedJob._id, approvalNotes);
      
      setApproveDialog(false);
      setSelectedJob(null);
      setApprovalNotes('');
      
      // Refresh the jobs list
      fetchPendingJobs();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to approve job');
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedJob || !rejectionReason.trim()) {
      setActionError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      setActionError('');
      
      await jobService.rejectJob(selectedJob._id, rejectionReason);
      
      setRejectDialog(false);
      setSelectedJob(null);
      setRejectionReason('');
      
      // Refresh the jobs list
      fetchPendingJobs();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to reject job');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseDialogs = () => {
    setApproveDialog(false);
    setRejectDialog(false);
    setSelectedJob(null);
    setApprovalNotes('');
    setRejectionReason('');
    setActionError('');
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Pending Jobs Approval
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Review and approve job postings from recruiters
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {jobs.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Jobs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {jobs.reduce((sum, job) => sum + job.applicationCount, 0)}
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
                    <Typography variant="h4" color="info.main">
                      {new Set(jobs.map(job => job.companyName)).size}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Companies
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + job.applicationCount, 0) / jobs.length) : 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Applications/Job
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Jobs Awaiting Approval
                </Typography>
                {jobs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No pending jobs to review
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Job Title</TableCell>
                          <TableCell>Company</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Salary</TableCell>
                          <TableCell>Posted By</TableCell>
                          <TableCell>Applications</TableCell>
                          <TableCell>Posted Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Business sx={{ mr: 1, color: 'primary.main' }} />
                                {job.title}
                              </Box>
                            </TableCell>
                            <TableCell>{job.companyName}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>
                              <Chip label={`₹${job.ctc?.min}-${job.ctc?.max} ${job.ctc?.currency || 'LPA'}`} color="success" size="small" />
                            </TableCell>
                            <TableCell>
                              {typeof job.postedBy === 'object' && job.postedBy !== null 
                                ? (job.postedBy as any).fullName || 'Unknown'
                                : job.postedBy || 'Unknown'
                              }
                            </TableCell>
                            <TableCell>
                              <Chip label={job.applicationCount} color="info" size="small" />
                            </TableCell>
                            <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                                <Visibility />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="success" 
                                sx={{ mr: 1 }}
                                onClick={() => handleApprove(job)}
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleReject(job)}
                              >
                                <Cancel />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Approval Dialog */}
        <Dialog open={approveDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
          <DialogTitle>Approve Job Posting</DialogTitle>
          <DialogContent>
            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionError}
              </Alert>
            )}
            
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to approve the job posting for "{selectedJob?.title}" at {selectedJob?.companyName}?
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              This will make the job visible to all students and allow them to apply.
            </Typography>

            <TextField
              fullWidth
              label="Approval Notes (Optional)"
              multiline
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove} 
              variant="contained" 
              color="success"
              disabled={processing}
            >
              {processing ? <CircularProgress size={20} /> : 'Approve'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
          <DialogTitle>Reject Job Posting</DialogTitle>
          <DialogContent>
            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionError}
              </Alert>
            )}
            
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to reject the job posting for "{selectedJob?.title}" at {selectedJob?.companyName}?
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Please provide a reason for rejection:
            </Typography>

            <TextField
              fullWidth
              label="Rejection Reason"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this job posting is being rejected..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReject} 
              variant="contained" 
              color="error"
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? <CircularProgress size={20} /> : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default PendingJobsPage;
