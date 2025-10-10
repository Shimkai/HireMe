import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, TextField, InputAdornment, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Menu, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Search, Visibility, Download, Email, Phone, School, Work, CheckCircle, Cancel, Star, MoreVert } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const ApplicantsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch applications for all jobs posted by this recruiter
      const response = await applicationService.getMyJobApplications();
      setApplications(response.data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(application => {
    const student = application.studentId as any;
    const job = application.jobId as any;
    
    const matchesSearch = 
      student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'default';
      case 'Under Review': return 'info';
      case 'Shortlisted': return 'warning';
      case 'Interview Scheduled': return 'primary';
      case 'Accepted': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const handleViewProfile = (application: Application) => {
    setSelectedApplication(application);
    setViewDialog(true);
  };

  const handleStatusChange = (application: Application, status: string) => {
    setSelectedApplication(application);
    setNewStatus(status);
    setStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedApplication) return;

    try {
      setProcessing(true);
      await applicationService.updateApplicationStatus(
        selectedApplication._id,
        newStatus,
        recruiterNotes,
        rejectionReason
      );
      
      setStatusDialog(false);
      setSelectedApplication(null);
      setNewStatus('');
      setRecruiterNotes('');
      setRejectionReason('');
      
      // Refresh applications
      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update application status');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResume = (application: Application) => {
    if (application.resume?.path) {
      window.open(`http://localhost:5000${application.resume.path}`, '_blank');
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

  const getStudentName = (application: Application) => {
    if (typeof application.studentId === 'object' && application.studentId !== null) {
      return (application.studentId as any).fullName || 'Unknown Student';
    }
    return 'Unknown Student';
  };

  const getStudentEmail = (application: Application) => {
    if (typeof application.studentId === 'object' && application.studentId !== null) {
      return (application.studentId as any).email || 'Unknown Email';
    }
    return 'Unknown Email';
  };

  const getJobTitle = (application: Application) => {
    if (typeof application.jobId === 'object' && application.jobId !== null) {
      return (application.jobId as any).title || 'Unknown Job';
    }
    return 'Unknown Job';
  };

  const getStudentDetails = (application: Application) => {
    if (typeof application.studentId === 'object' && application.studentId !== null) {
      return application.studentId as any;
    }
    return null;
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Job Applicants
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Review and manage job applications
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
                      Total Applicants
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {applications.filter(app => app.status === 'Shortlisted').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Shortlisted
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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search applicants by name, email, college, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="outlined" fullWidth startIcon={<Download />}>
                  Export to Excel
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applicant Details
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>College</TableCell>
                    <TableCell>Job Applied</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          No applications found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {applications.length === 0 
                            ? 'No students have applied to your jobs yet.' 
                            : 'No applications match your current filters.'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {getStudentName(application).charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {getStudentName(application)}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {getStudentEmail(application)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {getStudentDetails(application)?.studentDetails?.college?.name || 'Unknown College'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {getStudentDetails(application)?.studentDetails?.course || 'Unknown Course'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              CGPA: {getStudentDetails(application)?.studentDetails?.cgpa || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Work sx={{ mr: 1, color: 'primary.main' }} />
                            {getJobTitle(application)}
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              title="View Profile"
                              onClick={() => handleViewProfile(application)}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="secondary" 
                              title="Download Resume" 
                              onClick={() => downloadResume(application)}
                            >
                              <Download />
                            </IconButton>
                            {(application.status === 'Applied' || application.status === 'Under Review') && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success" 
                                  title="Shortlist" 
                                  onClick={() => handleStatusChange(application, 'Shortlisted')}
                                >
                                  <CheckCircle />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  title="Reject" 
                                  onClick={() => handleStatusChange(application, 'Rejected')}
                                >
                                  <Cancel />
                                </IconButton>
                              </>
                            )}
                            {application.status === 'Shortlisted' && (
                              <IconButton 
                                size="small" 
                                color="success" 
                                title="Accept" 
                                onClick={() => handleStatusChange(application, 'Accepted')}
                              >
                                <Star />
                              </IconButton>
                            )}
                          </Box>
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
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<Email />}>
                  Send Bulk Email
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<Download />}>
                  Download All Resumes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<CheckCircle />}>
                  Shortlist All
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth startIcon={<Phone />}>
                  Schedule Interviews
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
          </>
        )}

        {/* View Student Profile Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                        {getStudentName(selectedApplication).charAt(0)}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {getStudentName(selectedApplication)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {getStudentEmail(selectedApplication)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>Academic Details</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2"><strong>College:</strong> {getStudentDetails(selectedApplication)?.studentDetails?.college?.name || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Course:</strong> {getStudentDetails(selectedApplication)?.studentDetails?.course || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>CGPA:</strong> {getStudentDetails(selectedApplication)?.studentDetails?.cgpa || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Year of Completion:</strong> {getStudentDetails(selectedApplication)?.studentDetails?.yearOfCompletion || 'N/A'}</Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {(getStudentDetails(selectedApplication)?.studentDetails?.skills || []).map((skill: string, index: number) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                    </Box>

                    <Typography variant="h6" gutterBottom>Application Details</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2"><strong>Job Applied:</strong> {getJobTitle(selectedApplication)}</Typography>
                      <Typography variant="body2"><strong>Applied Date:</strong> {formatDate(selectedApplication.appliedAt)}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> 
                        <Chip 
                          label={selectedApplication.status} 
                          color={getStatusColor(selectedApplication.status) as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => downloadResume(selectedApplication!)}
              startIcon={<Download />}
            >
              Download Resume
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Application Status Dialog */}
        <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Update status for <strong>{getStudentName(selectedApplication)}</strong> applying to <strong>{getJobTitle(selectedApplication)}</strong>
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="New Status"
                  >
                    <MenuItem value="Under Review">Under Review</MenuItem>
                    <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                    <MenuItem value="Interview Scheduled">Interview Scheduled</MenuItem>
                    <MenuItem value="Accepted">Accepted</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Recruiter Notes"
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Add any notes about this candidate..."
                />

                {newStatus === 'Rejected' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Rejection Reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    sx={{ mt: 2 }}
                    placeholder="Reason for rejection..."
                    required
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmStatusChange} 
              variant="contained"
              disabled={processing || !newStatus}
            >
              {processing ? <CircularProgress size={20} /> : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default ApplicantsPage;
