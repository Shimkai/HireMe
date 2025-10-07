import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Work,
  CheckCircle,
  Cancel,
  FilterList,
  Visibility,
} from '@mui/icons-material';
import { jobService } from '../../services/jobService';
import { format } from 'date-fns';
import { Job } from '../../types';

const ApproveJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [approvalData, setApprovalData] = useState({
    approvalNotes: '',
  });
  const [rejectionData, setRejectionData] = useState({
    rejectionReason: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getAllJobs({ limit: 100 });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async () => {
    if (!selectedJob) return;

    try {
      await jobService.approveJob(selectedJob._id, approvalData.approvalNotes);
      setApproveDialogOpen(false);
      setSelectedJob(null);
      setApprovalData({ approvalNotes: '' });
      fetchJobs();
      // Alert removed - dialog closes automatically after successful approval
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve job');
    }
  };

  const handleRejectJob = async () => {
    if (!selectedJob) return;

    try {
      await jobService.rejectJob(selectedJob._id, rejectionData.rejectionReason);
      setRejectDialogOpen(false);
      setSelectedJob(null);
      setRejectionData({ rejectionReason: '' });
      fetchJobs();
      alert('Job rejected successfully');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reject job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
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

  const filteredJobs = jobs.filter(job => 
    !statusFilter || job.status === statusFilter
  );

  const paginatedJobs = filteredJobs.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Work sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Approve Jobs
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          onClick={() => window.location.href = '/tnp/dashboard'}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterList color="action" />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              label="Filter by Status"
            >
              <MenuItem value="">All Jobs</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Jobs Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Jobs will appear here once recruiters start posting.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Details</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>CTC Range</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Posted Date</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedJobs.map((job) => (
                  <TableRow key={job._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.designation} • {job.location} • {job.jobType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {job.companyName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {typeof job.postedBy === 'object' ? job.postedBy?.recruiterDetails?.industry : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(job.ctc.min)} - {formatCurrency(job.ctc.max)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
                      </Typography>
                      {new Date(job.applicationDeadline) < new Date() && (
                        <Chip
                          label="Expired"
                          color="error"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedJob(job);
                            // Show job details in a dialog
                          }}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        {job.status === 'Pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedJob(job);
                                setApproveDialogOpen(true);
                              }}
                              title="Approve Job"
                              color="success"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedJob(job);
                                setRejectDialogOpen(true);
                              }}
                              title="Reject Job"
                              color="error"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredJobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog
          open={!!selectedJob && !approveDialogOpen && !rejectDialogOpen}
          onClose={() => setSelectedJob(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Job Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedJob.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedJob.designation} • {selectedJob.location} • {selectedJob.jobType}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Company Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Company:</strong> {selectedJob.companyName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Industry:</strong> {typeof selectedJob.postedBy === 'object' ? selectedJob.postedBy?.recruiterDetails?.industry : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Posted by:</strong> {typeof selectedJob.postedBy === 'object' ? selectedJob.postedBy?.fullName : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Compensation
                    </Typography>
                    <Typography variant="body2">
                      <strong>CTC Range:</strong> {formatCurrency(selectedJob.ctc.min)} - {formatCurrency(selectedJob.ctc.max)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Currency:</strong> {selectedJob.ctc.currency}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedJob.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Skills
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedJob.skillsRequired.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Eligibility Criteria
                </Typography>
                <Typography variant="body2">
                  <strong>Min CGPA:</strong> {selectedJob.eligibility.minCGPA || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Max Backlogs:</strong> {selectedJob.eligibility.maxBacklogs || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Allowed Courses:</strong> {selectedJob.eligibility.allowedCourses?.join(', ') || 'All courses'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedJob(null)}>
              Close
            </Button>
            {selectedJob.status === 'Pending' && (
              <>
                <Button
                  onClick={() => {
                    setApproveDialogOpen(true);
                  }}
                  variant="contained"
                  color="success"
                >
                  Approve Job
                </Button>
                <Button
                  onClick={() => {
                    setRejectDialogOpen(true);
                  }}
                  variant="contained"
                  color="error"
                >
                  Reject Job
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Approval Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Job</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Approve job: <strong>{selectedJob?.title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Company: {selectedJob?.companyName}
          </Typography>
          <TextField
            fullWidth
            label="Approval Notes (Optional)"
            value={approvalData.approvalNotes}
            onChange={(e) => setApprovalData(prev => ({ ...prev, approvalNotes: e.target.value }))}
            multiline
            rows={3}
            placeholder="Add notes about the approval..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApproveJob}
            variant="contained"
            color="success"
          >
            Approve Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Job</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Reject job: <strong>{selectedJob?.title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Company: {selectedJob?.companyName}
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason"
            value={rejectionData.rejectionReason}
            onChange={(e) => setRejectionData(prev => ({ ...prev, rejectionReason: e.target.value }))}
            multiline
            rows={3}
            placeholder="Provide a reason for rejection..."
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectJob}
            variant="contained"
            color="error"
            disabled={!rejectionData.rejectionReason.trim()}
          >
            Reject Job
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApproveJobs;
