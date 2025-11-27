import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField, ToggleButtonGroup, ToggleButton, Stack, InputAdornment, MenuItem, Select, FormControl, InputLabel, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { CheckCircle, Cancel, Visibility, Business, FilterList, People as PeopleIcon, Download } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { Application, User } from '../../types';
import { Job } from '../../types';

const statusOptions = [
  { value: 'Pending', label: 'Jobs waiting approval' },
  { value: 'Approved', label: 'Approved jobs' },
  { value: 'Rejected', label: 'Rejected jobs' },
];

type ExportFilter = 'all' | 'shortlisted' | 'placed' | 'others';

const PendingJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [applicationsDialog, setApplicationsDialog] = useState({
    open: false,
    job: null as Job | null,
  });
  const [applicationsData, setApplicationsData] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [applicationsSearch, setApplicationsSearch] = useState('');
  const [applicationsSort, setApplicationsSort] = useState<'latest' | 'oldest' | 'status'>('latest');
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportStatusFilter, setExportStatusFilter] = useState<ExportFilter>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs({ limit: 200 });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch jobs');
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
      fetchJobs();
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
      fetchJobs();
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

  const filteredJobs = jobs.filter((job) => job.status === statusFilter);
  const pendingCount = jobs.filter(job => job.status === 'Pending').length;
  const totalApplications = jobs.reduce((sum, job) => sum + job.applicationCount, 0);
  const uniqueCompanies = new Set(jobs.map(job => job.companyName)).size;
  const avgApplications = jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0;

  const openDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsDialog(true);
  };

  const closeDetails = () => {
    setDetailsDialog(false);
    setSelectedJob(null);
  };

  const openApplicationsDialog = async (job: Job) => {
    setApplicationsDialog({ open: true, job });
    setApplicationsLoading(true);
    setApplicationsError('');
    setApplicationsSearch('');
    setApplicationsSort('latest');

    try {
      const response = await applicationService.getJobApplications(job._id);
      setApplicationsData(response.data || []);
    } catch (error: any) {
      console.error('Failed to load job applications:', error);
      setApplicationsError(error.response?.data?.error?.message || 'Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleOpenExportDialog = () => {
    if (!applicationsDialog.job) return;
    setExportStatusFilter('all');
    setExportError('');
    setExportDialogOpen(true);
  };

  const handleCloseExportDialog = () => {
    if (exporting) return;
    setExportDialogOpen(false);
    setExportStatusFilter('all');
    setExportError('');
  };

  const handleExportApplicants = async () => {
    if (!applicationsDialog.job) return;
    try {
      setExporting(true);
      setExportError('');

      const response = await jobService.exportJobApplications(applicationsDialog.job._id, exportStatusFilter);

      const contentType =
        response.headers?.['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      let filename = `${applicationsDialog.job.title.replace(/[^a-z0-9]/gi, '_')}_applications.xlsx`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      handleCloseExportDialog();
    } catch (err: any) {
      console.error('Export error:', err);
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to export applicants. Please try again.';
      setExportError(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const closeApplicationsDialog = () => {
    setApplicationsDialog({ open: false, job: null });
    setApplicationsData([]);
    setApplicationsSearch('');
    setApplicationsSort('latest');
  };

  const filteredApplications = applicationsData
    .filter((app) => {
      if (!applicationsSearch) return true;
      const student = (app.studentId as User) || {};
      const searchLower = applicationsSearch.toLowerCase();
      return (
        student.fullName?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.studentDetails?.courseName?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (applicationsSort === 'status') {
        return a.status.localeCompare(b.status);
      }
      const dateA = new Date(a.appliedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.appliedAt || b.createdAt || 0).getTime();
      return applicationsSort === 'latest' ? dateB - dateA : dateA - dateB;
    });

  const applicationsCounts = applicationsData.reduce(
    (acc, app) => {
      acc.total += 1;
      if (app.status === 'Shortlisted') acc.shortlisted += 1;
      else if (app.status === 'Accepted' || app.status === 'Offered') acc.placed += 1;
      else acc.pending += 1;
      return acc;
    },
    { total: 0, shortlisted: 0, placed: 0, pending: 0 }
  );

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
                      {pendingCount}
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
                      {totalApplications}
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
                      {uniqueCompanies}
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
                      {avgApplications}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Applications/Job
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FilterList color="action" />
                  </Box>
                  <ToggleButtonGroup
                    exclusive
                    value={statusFilter}
                    onChange={(_event, value) => {
                      if (value) {
                        setStatusFilter(value);
                      }
                    }}
                    size="small"
                    sx={{ flexWrap: 'wrap' }}
                  >
                    {statusOptions.map((option) => (
                      <ToggleButton key={option.value} value={option.value}>
                        {option.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Jobs Awaiting Approval
                </Typography>
                {filteredJobs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No jobs to review for this status
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
                        {filteredJobs.map((job) => {
                          const deadline = new Date(job.applicationDeadline);
                          const deadlinePassed = deadline < new Date();
                          return (
                          <TableRow key={job._id} sx={{ opacity: deadlinePassed ? 0.5 : 1 }}>
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
                              <IconButton size="small" color="primary" sx={{ mr: 1 }} onClick={() => openDetails(job)}>
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" color="secondary" sx={{ mr: 1 }} onClick={() => openApplicationsDialog(job)}>
                                <PeopleIcon />
                              </IconButton>
                      {(job.status === 'Pending' || job.status === 'Rejected') && (
                                <IconButton 
                                  size="small" 
                                  color="success" 
                                  sx={{ mr: 1 }}
                                  onClick={() => handleApprove(job)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              )}
                              {(job.status === 'Pending' || job.status === 'Approved') && (
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleReject(job)}
                                >
                                  <Cancel />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Job Details Dialog */}
        <Dialog open={detailsDialog && !!selectedJob} onClose={closeDetails} maxWidth="md" fullWidth>
          {selectedJob && (
            <>
              <DialogTitle>Job Details</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedJob.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {selectedJob.designation} • {selectedJob.location} • {selectedJob.jobType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Company Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Company:</strong> {selectedJob.companyName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Posted by:</strong>{' '}
                      {typeof selectedJob.postedBy === 'object' && selectedJob.postedBy !== null
                        ? (selectedJob.postedBy as any).fullName || 'Unknown'
                        : selectedJob.postedBy || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Compensation
                    </Typography>
                    <Typography variant="body2">
                      <strong>CTC Range:</strong> ₹{selectedJob.ctc?.min ?? 0} - ₹{selectedJob.ctc?.max ?? 0}{' '}
                      {selectedJob.ctc?.currency || 'INR'}
                    </Typography>
                  </Grid>
                  {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Required Skills
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {selectedJob.skillsRequired.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Job Description
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedJob.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Eligibility Criteria
                    </Typography>
                    <Typography variant="body2">
                      <strong>Min CGPA:</strong> {selectedJob.eligibility?.minCGPA ?? 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Max Backlogs:</strong> {selectedJob.eligibility?.maxBacklogs ?? 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Allowed Courses:</strong>{' '}
                      {selectedJob.eligibility?.allowedCourses?.length
                        ? selectedJob.eligibility.allowedCourses.join(', ')
                        : 'All courses'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Important Dates
                    </Typography>
                    <Typography variant="body2">
                      <strong>Posted:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Deadline:</strong> {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeDetails}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Applications Dialog */}
        <Dialog
          open={applicationsDialog.open}
          onClose={closeApplicationsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Applications for {applicationsDialog.job?.title}
          </DialogTitle>
          <DialogContent>
            {applicationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : applicationsError ? (
              <Alert severity="error">{applicationsError}</Alert>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary">
                          {applicationsCounts.total}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Applications
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main">
                          {applicationsCounts.shortlisted}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Shortlisted
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="info.main">
                          {applicationsCounts.placed}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Placed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="warning.main">
                          {applicationsCounts.pending}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Others
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search students"
                    value={applicationsSearch}
                    onChange={(e) => setApplicationsSearch(e.target.value)}
                    placeholder="Search by name, email, or branch"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleOpenExportDialog}
                    disabled={applicationsData.length === 0}
                    sx={{ minWidth: 160 }}
                  >
                    Export Excel
                  </Button>
                </Box>

                {filteredApplications.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No applications match your search.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Course / Branch</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Applied On</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredApplications.map((app) => {
                          const student = (app.studentId as User) || {};
                          return (
                            <TableRow key={app._id}>
                              <TableCell>{student.fullName || 'Unknown'}</TableCell>
                              <TableCell>{student.email || 'N/A'}</TableCell>
                              <TableCell>{student.studentDetails?.courseName || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={app.status}
                                  size="small"
                                  color={
                                    app.status === 'Shortlisted'
                                      ? 'success'
                                      : app.status === 'Accepted' || app.status === 'Offered'
                                      ? 'primary'
                                      : 'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(app.appliedAt || app.createdAt || '').toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeApplicationsDialog}>Close</Button>
          </DialogActions>
        </Dialog>

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

        {/* Export Applicants Dialog */}
        {applicationsDialog.job && (
          <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Export Applicants for {applicationsDialog.job.title}</DialogTitle>
            <DialogContent>
              {exportError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {exportError}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose which applicants you want to include in the Excel file.
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Applicant Group</FormLabel>
                <RadioGroup
                  value={exportStatusFilter}
                  onChange={(e) => setExportStatusFilter(e.target.value as ExportFilter)}
                >
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label="All applied students"
                  />
                  <FormControlLabel
                    value="shortlisted"
                    control={<Radio />}
                    label="Shortlisted students"
                  />
                  <FormControlLabel
                    value="placed"
                    control={<Radio />}
                    label="Placed students"
                  />
                  <FormControlLabel
                    value="others"
                    control={<Radio />}
                    label="Not yet shortlisted or placed"
                  />
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseExportDialog} disabled={exporting}>
                Cancel
              </Button>
              <Button
                onClick={handleExportApplicants}
                variant="contained"
                disabled={exporting}
              >
                {exporting ? <CircularProgress size={20} /> : 'Download Excel'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </MainLayout>
  );
};

export default PendingJobsPage;
