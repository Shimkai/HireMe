import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
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
  Avatar,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assignment,
  FilterList,
  Download,
  Visibility,
  Business,
  Close,
} from '@mui/icons-material';
import { applicationService, Application } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';
import { format } from 'date-fns';

interface ApplicationWithDetails extends Application {
  studentDetails?: {
    fullName: string;
    email: string;
    mobileNumber: string;
    profileAvatar?: string;
    studentDetails?: {
      courseName: string;
      college: string | { _id: string; name: string };
      isVerified: boolean;
      placementStatus: string;
      cgpa?: number;
      yearOfCompletion?: number;
      registrationNumber?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
      };
      tenthMarks?: {
        percentage?: number;
        marksheet?: string;
      };
      twelfthMarks?: {
        percentage?: number;
        marksheet?: string;
      };
      lastSemesterMarksheet?: string;
      areaOfInterest?: string[];
    };
  };
  jobDetails?: any;
}

const ViewApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching applications data...');
      
      // Fetch all jobs first
      const jobsResponse = await jobService.getAllJobs({ limit: 100 });
      setJobs(jobsResponse.data);
      console.log('Jobs fetched:', jobsResponse.data.length);
      console.log('All jobs:', jobsResponse.data.map(job => ({ id: job._id, title: job.title, status: job.status })));
      
      // Fetch all students once to avoid multiple API calls
      let allStudents: any[] = [];
      try {
        const studentsResponse = await userService.getStudents({ limit: 1000 });
        allStudents = studentsResponse.data;
        console.log('Students fetched:', allStudents.length);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        allStudents = [];
      }

      // Fetch applications for all jobs with student details
      let allApplications: ApplicationWithDetails[] = [];
      
      // Process jobs in batches to avoid rate limiting
      const batchSize = 3; // Reduced batch size to avoid rate limiting
      setLoadingProgress({ current: 0, total: jobsResponse.data.length });
      
      for (let i = 0; i < jobsResponse.data.length; i += batchSize) {
        const batch = jobsResponse.data.slice(i, i + batchSize);
        
        // Process batch sequentially to avoid rate limiting
        for (const job of batch) {
          try {
            console.log(`Processing job: ${job._id} - ${job.title}`);
            const applicationsResponse = await applicationService.getJobApplications(job._id);
            console.log(`Applications for job ${job.title} (${job._id}):`, applicationsResponse.data.length);
            
            // For each application, find student details from our cached list
            for (const app of applicationsResponse.data) {
              const student = allStudents.find((s: any) => s._id === app.studentId);
              
              const applicationWithDetails: ApplicationWithDetails = {
                ...app,
                jobDetails: job,
                studentDetails: student ? {
                  fullName: student.fullName,
                  email: student.email,
                  mobileNumber: student.mobileNumber,
                  profileAvatar: student.profileAvatar,
                  studentDetails: student.studentDetails
                } : undefined
              };
              
              allApplications.push(applicationWithDetails);
            }
            
            // Update progress
            setLoadingProgress(prev => ({ ...prev, current: prev.current + 1 }));
          } catch (error: any) {
            if (error.response?.status === 429) {
              console.warn(`Rate limited for job ${job._id}, waiting 5 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
              // Retry once
              try {
                const applicationsResponse = await applicationService.getJobApplications(job._id);
                console.log(`Applications for job ${job.title} (${job._id}) after retry:`, applicationsResponse.data.length);
                
                for (const app of applicationsResponse.data) {
                  const student = allStudents.find((s: any) => s._id === app.studentId);
                  
                  const applicationWithDetails: ApplicationWithDetails = {
                    ...app,
                    jobDetails: job,
                    studentDetails: student ? {
                      fullName: student.fullName,
                      email: student.email,
                      mobileNumber: student.mobileNumber,
                      profileAvatar: student.profileAvatar,
                      studentDetails: student.studentDetails
                    } : undefined
                  };
                  
                  allApplications.push(applicationWithDetails);
                }
              } catch (retryError) {
                console.error(`Failed to fetch applications for job ${job._id} after retry:`, retryError);
              }
            } else {
              console.error(`Failed to fetch applications for job ${job._id}:`, error);
            }
          }
        }

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < jobsResponse.data.length) {
          console.log('Waiting 2 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
      
      console.log('Total applications with details:', allApplications.length);
      setApplications(allApplications);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
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

  const downloadResume = (application: Application) => {
    const link = document.createElement('a');
    link.href = `/api/uploads/resumes/${application.resume.filename}`;
    link.download = application.resume.originalName;
    link.click();
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesJob = !jobFilter || app.jobDetails._id === jobFilter;
    return matchesStatus && matchesJob;
  });

  const paginatedApplications = filteredApplications.slice(
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading Applications...
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="200px" gap={2}>
          <CircularProgress />
          {loadingProgress.total > 0 && (
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Processing jobs: {loadingProgress.current} / {loadingProgress.total}
              </Typography>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                <Box 
                  sx={{ 
                    width: `${(loadingProgress.current / loadingProgress.total) * 100}%`, 
                    bgcolor: 'primary.main', 
                    height: '100%', 
                    borderRadius: 1,
                    transition: 'width 0.3s ease'
                  }} 
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          View Applications
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success">
                {applications.filter(app => app.status === 'Accepted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accepted Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning">
                {applications.filter(app => app.status === 'Applied').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info">
                {jobs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              <MenuItem value="">All Applications</MenuItem>
              <MenuItem value="Applied">Applied</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Shortlisted">Shortlisted</MenuItem>
              <MenuItem value="Interview Scheduled">Interview Scheduled</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Job</InputLabel>
            <Select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setPage(0);
              }}
              label="Filter by Job"
            >
              <MenuItem value="">All Jobs</MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>
                  {job.title} - {job.companyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Applications Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Applications will appear here once students start applying to jobs.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Branch/Course</TableCell>
                  <TableCell>Job Applied For</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Placement Status</TableCell>
                  <TableCell>Resume</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplications.map((application) => (
                  <TableRow key={application._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={application.studentDetails?.profileAvatar ? `http://localhost:5000${application.studentDetails.profileAvatar}` : undefined}
                        >
                          {application.studentDetails?.fullName?.charAt(0) || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {application.studentDetails?.fullName || `Student #${application.studentId.slice(-6)}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {application.studentDetails?.email || 'Email not available'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {application.studentDetails?.studentDetails?.courseName || 'Not specified'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {typeof application.studentDetails?.studentDetails?.college === 'object' && application.studentDetails?.studentDetails?.college
                            ? application.studentDetails.studentDetails.college.name 
                            : (typeof application.studentDetails?.studentDetails?.college === 'string' 
                                ? application.studentDetails.studentDetails.college 
                                : 'College not specified')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {application.jobDetails?.title || 'Job not found'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.jobDetails?.designation} • {application.jobDetails?.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" />
                        <Typography variant="body2">
                          {application.jobDetails?.companyName || 'Company not found'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.studentDetails?.studentDetails?.placementStatus || 'Not Placed'}
                        color={application.studentDetails?.studentDetails?.placementStatus === 'Placed' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => downloadResume(application)}
                        title="Download Resume"
                      >
                        <Download />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setViewingStudent(application.studentDetails);
                            setProfileDialogOpen(true);
                          }}
                          title="View Student Profile"
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedApplication(application);
                            setDetailsDialogOpen(true);
                          }}
                          title="View Application Details"
                        >
                          <Assignment />
                        </IconButton>
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
            count={filteredApplications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Application Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Application Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Job Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Title:</strong> {selectedApplication.jobDetails.title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Company:</strong> {selectedApplication.jobDetails.companyName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedApplication.jobDetails.location}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {selectedApplication.jobDetails.jobType}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Application Status
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedApplication.status}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Applied Date:</strong> {format(new Date(selectedApplication.appliedAt), 'MMM dd, yyyy')}
                    </Typography>
                    {selectedApplication.reviewedAt && (
                      <Typography variant="body2">
                        <strong>Reviewed Date:</strong> {format(new Date(selectedApplication.reviewedAt), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Resume Information
                </Typography>
                <Typography variant="body2">
                  <strong>File:</strong> {selectedApplication.resume.originalName}
                </Typography>
                <Typography variant="body2">
                  <strong>Size:</strong> {(selectedApplication.resume.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Typography variant="body2">
                  <strong>Uploaded:</strong> {format(new Date(selectedApplication.resume.uploadedAt), 'MMM dd, yyyy')}
                </Typography>
              </Grid>
              {selectedApplication.recruiterNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recruiter Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.recruiterNotes}
                  </Typography>
                </Grid>
              )}
              {selectedApplication.interviewDetails && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Interview Details
                  </Typography>
                  <Typography variant="body2">
                    <strong>Scheduled Date:</strong> {selectedApplication.interviewDetails.scheduledDate ? format(new Date(selectedApplication.interviewDetails.scheduledDate), 'MMM dd, yyyy') : 'Not scheduled'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {selectedApplication.interviewDetails.scheduledTime || 'Not specified'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mode:</strong> {selectedApplication.interviewDetails.interviewMode || 'Not specified'}
                  </Typography>
                  {selectedApplication.interviewDetails.instructions && (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      <strong>Instructions:</strong> {selectedApplication.interviewDetails.instructions}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              if (selectedApplication) {
                downloadResume(selectedApplication);
              }
            }}
            variant="contained"
            startIcon={<Download />}
          >
            Download Resume
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Profile View Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Student Profile - {viewingStudent?.fullName || 'Loading...'}
          </Typography>
          <IconButton onClick={() => setProfileDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingStudent ? (
            <Box>
              {/* Profile Header */}
              <Box display="flex" alignItems="center" gap={3} mb={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Avatar
                  src={viewingStudent.profileAvatar ? `http://localhost:5000${viewingStudent.profileAvatar}` : undefined}
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                >
                  {viewingStudent.fullName?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {viewingStudent.fullName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {viewingStudent.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewingStudent.mobileNumber}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={viewingStudent.studentDetails?.isVerified ? 'Verified' : 'Unverified'}
                      color={viewingStudent.studentDetails?.isVerified ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip
                      label={viewingStudent.studentDetails?.placementStatus || 'Not Placed'}
                      color={viewingStudent.studentDetails?.placementStatus === 'Placed' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Academic Information */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Academic Information
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Typography variant="body2">
                        <strong>Course:</strong> {viewingStudent.studentDetails?.courseName || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>College:</strong> {typeof viewingStudent.studentDetails?.college === 'object' && viewingStudent.studentDetails?.college
                          ? viewingStudent.studentDetails.college.name 
                          : viewingStudent.studentDetails?.college || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Year of Completion:</strong> {viewingStudent.studentDetails?.yearOfCompletion || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>CGPA:</strong> {viewingStudent.studentDetails?.cgpa || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Registration Number:</strong> {viewingStudent.studentDetails?.registrationNumber || 'Not assigned'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Contact Information
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {viewingStudent.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mobile:</strong> {viewingStudent.mobileNumber}
                      </Typography>
                      {viewingStudent.studentDetails?.address && (
                        <>
                          <Typography variant="body2">
                            <strong>Address:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            {viewingStudent.studentDetails.address.street && `${viewingStudent.studentDetails.address.street}, `}
                            {viewingStudent.studentDetails.address.city && `${viewingStudent.studentDetails.address.city}, `}
                            {viewingStudent.studentDetails.address.state && `${viewingStudent.studentDetails.address.state} `}
                            {viewingStudent.studentDetails.address.pincode && `- ${viewingStudent.studentDetails.address.pincode}`}
                            {viewingStudent.studentDetails.address.country && `, ${viewingStudent.studentDetails.address.country}`}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Educational Marks */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Educational Marks
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            10th Standard
                          </Typography>
                          <Typography variant="body2">
                            <strong>Percentage:</strong> {viewingStudent.studentDetails?.tenthMarks?.percentage || 'Not specified'}%
                          </Typography>
                          {viewingStudent.studentDetails?.tenthMarks?.marksheet && (
                            <Button
                              size="small"
                              startIcon={<Download />}
                              onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.tenthMarks?.marksheet}`, '_blank')}
                              sx={{ mt: 1 }}
                            >
                              Download Marksheet
                            </Button>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            12th Standard
                          </Typography>
                          <Typography variant="body2">
                            <strong>Percentage:</strong> {viewingStudent.studentDetails?.twelfthMarks?.percentage || 'Not specified'}%
                          </Typography>
                          {viewingStudent.studentDetails?.twelfthMarks?.marksheet && (
                            <Button
                              size="small"
                              startIcon={<Download />}
                              onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.twelfthMarks?.marksheet}`, '_blank')}
                              sx={{ mt: 1 }}
                            >
                              Download Marksheet
                            </Button>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Last Semester
                          </Typography>
                          <Typography variant="body2">
                            <strong>Marksheet:</strong> {viewingStudent.studentDetails?.lastSemesterMarksheet ? 'Available' : 'Not uploaded'}
                          </Typography>
                          {viewingStudent.studentDetails?.lastSemesterMarksheet && (
                            <Button
                              size="small"
                              startIcon={<Download />}
                              onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.lastSemesterMarksheet}`, '_blank')}
                              sx={{ mt: 1 }}
                            >
                              Download Marksheet
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Area of Interest */}
                {viewingStudent.studentDetails?.areaOfInterest && viewingStudent.studentDetails.areaOfInterest.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Areas of Interest
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {viewingStudent.studentDetails.areaOfInterest.map((area: string, index: number) => (
                          <Chip key={index} label={area} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography variant="body1" color="text.secondary">
                Loading student profile...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewApplications;
