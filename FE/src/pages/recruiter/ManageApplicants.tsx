import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  Search,
  MoreVert,
  CheckCircle,
  Star,
  StarBorder,
  Work,
  School,
  Email,
  Phone,
  LocationOn,
  Download,
  Close,
  Person,
  Assignment,
} from '@mui/icons-material';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';
import { resumeService } from '../../services/resumeService';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface Applicant {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    profileAvatar?: string;
    studentDetails: {
      courseName: string;
      college: string | { _id: string; name: string };
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
      areaOfInterest?: string[];
    };
  };
  jobId: {
    _id: string;
    title: string;
    companyName: string;
  };
  status: string;
  appliedAt: string;
  shortlistedAt?: string;
  offeredAt?: string;
}

const ManageApplicants: React.FC = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Profile view dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  
  // Action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionApplicant, setActionApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    if (user?.role === 'Recruiter') {
      fetchApplicants();
    }
  }, [page, rowsPerPage, statusFilter, user]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      };
      
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const response = await applicationService.getRecruiterApplications(params);
      setApplicants(response.data || []);
    } catch (err: any) {
      console.error('Error fetching applicants:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setProfileDialogOpen(true);
    
    // Fetch resume data
    if (applicant.studentId?._id) {
      try {
        setResumeLoading(true);
        const resumeResponse = await resumeService.getStudentResume(applicant.studentId._id);
        setResumeData(resumeResponse.data);
      } catch (err) {
        console.error('Failed to fetch resume:', err);
        setResumeData(null);
      } finally {
        setResumeLoading(false);
      }
    } else {
      setResumeData(null);
    }
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, applicant: Applicant) => {
    setAnchorEl(event.currentTarget);
    setActionApplicant(applicant);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActionApplicant(null);
  };

  const handleShortlist = async (applicant: Applicant) => {
    try {
      await applicationService.updateApplicationStatus(applicant._id, {
        status: 'Shortlisted',
        shortlistedAt: new Date().toISOString(),
      });
      
      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app._id === applicant._id 
            ? { ...app, status: 'Shortlisted', shortlistedAt: new Date().toISOString() }
            : app
        )
      );
      
      handleActionClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to shortlist applicant');
    }
  };

  const handleOffer = async (applicant: Applicant) => {
    try {
      await applicationService.updateApplicationStatus(applicant._id, {
        status: 'Offered',
        offeredAt: new Date().toISOString(),
      });
      
      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app._id === applicant._id 
            ? { ...app, status: 'Offered', offeredAt: new Date().toISOString() }
            : app
        )
      );
      
      handleActionClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to offer position');
    }
  };

  const handleDownloadResume = async () => {
    if (!selectedApplicant || !selectedApplicant.studentId?._id) return;
    
    try {
      const response = await resumeService.generateResumePDF(selectedApplicant.studentId._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedApplicant.studentId?.fullName || 'Student'}_Resume.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download resume');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'default';
      case 'Shortlisted': return 'warning';
      case 'Offered': return 'success';
      case 'Rejected': return 'error';
      case 'Withdrawn': return 'info';
      default: return 'default';
    }
  };

  const filteredApplicants = applicants.filter(applicant =>
    (applicant.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (applicant.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (applicant.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  // Check if user is a recruiter
  if (user?.role !== 'Recruiter') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only recruiters can access this page.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Applicants
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search applicants..."
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
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Applied">Applied</MenuItem>
              <MenuItem value="Shortlisted">Shortlisted</MenuItem>
              <MenuItem value="Offered">Offered</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Withdrawn">Withdrawn</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Job Position</TableCell>
              <TableCell>Course & College</TableCell>
              <TableCell>CGPA</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No applicants found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {applicants.length === 0 
                      ? "No students have applied to your jobs yet. Share your job postings to attract applicants!"
                      : "No applicants match your current search criteria."
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplicants.map((applicant) => (
              <TableRow key={applicant._id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={applicant.studentId?.profileAvatar ? `http://localhost:5000${applicant.studentId.profileAvatar}` : undefined}
                      sx={{ width: 40, height: 40 }}
                    >
                      {applicant.studentId?.fullName?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {applicant.studentId?.fullName || 'Unknown Student'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {applicant.studentId?.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {applicant.jobId?.title || 'Job Title Not Available'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {applicant.jobId?.companyName || 'Company Not Available'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {applicant.studentId.studentDetails?.courseName || 'Not specified'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {applicant.studentId.studentDetails?.college 
                      ? (typeof applicant.studentId.studentDetails.college === 'object' 
                          ? applicant.studentId.studentDetails.college?.name || 'College not specified'
                          : applicant.studentId.studentDetails.college)
                      : 'College not specified'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {applicant.studentId.studentDetails?.cgpa || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {applicant.appliedAt ? format(new Date(applicant.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={applicant.status || 'Unknown'}
                    color={getStatusColor(applicant.status || 'Unknown') as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewProfile(applicant)}
                      title="View Profile"
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, applicant)}
                      title="More Actions"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredApplicants.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Profile View Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Student Profile - {selectedApplicant?.studentId?.fullName || 'Unknown Student'}
          </Typography>
          <IconButton onClick={() => setProfileDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedApplicant && (
            <Box>
              {/* Profile Header */}
              <Box display="flex" alignItems="center" gap={3} mb={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Avatar
                  src={selectedApplicant.studentId?.profileAvatar ? `http://localhost:5000${selectedApplicant.studentId.profileAvatar}` : undefined}
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                >
                  {selectedApplicant.studentId?.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography variant="h5" gutterBottom>
                    {selectedApplicant.studentId?.fullName || 'Unknown Student'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {selectedApplicant.studentId?.email || 'No email'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedApplicant.studentId?.mobileNumber || 'No mobile number'}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={selectedApplicant.status || 'Unknown'}
                      color={getStatusColor(selectedApplicant.status || 'Unknown') as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownloadResume}
                    disabled={!resumeData}
                    sx={{ mb: 1 }}
                  >
                    Download Resume
                  </Button>
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
                        <strong>Course:</strong> {selectedApplicant.studentId?.studentDetails?.courseName || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>College:</strong> {selectedApplicant.studentId?.studentDetails?.college 
                          ? (typeof selectedApplicant.studentId.studentDetails.college === 'object' 
                              ? selectedApplicant.studentId.studentDetails.college?.name || 'College not specified'
                              : selectedApplicant.studentId.studentDetails.college)
                          : 'College not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Year of Completion:</strong> {selectedApplicant.studentId?.studentDetails?.yearOfCompletion || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>CGPA:</strong> {selectedApplicant.studentId?.studentDetails?.cgpa || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Registration Number:</strong> {selectedApplicant.studentId?.studentDetails?.registrationNumber || 'Not assigned'}
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
                        <strong>Email:</strong> {selectedApplicant.studentId?.email || 'No email'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mobile:</strong> {selectedApplicant.studentId?.mobileNumber || 'No mobile number'}
                      </Typography>
                      {selectedApplicant.studentId?.studentDetails?.address && (
                        <>
                          <Typography variant="body2">
                            <strong>Address:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            {selectedApplicant.studentId.studentDetails.address.street && `${selectedApplicant.studentId.studentDetails.address.street}, `}
                            {selectedApplicant.studentId.studentDetails.address.city && `${selectedApplicant.studentId.studentDetails.address.city}, `}
                            {selectedApplicant.studentId.studentDetails.address.state && `${selectedApplicant.studentId.studentDetails.address.state} `}
                            {selectedApplicant.studentId.studentDetails.address.pincode && `${selectedApplicant.studentId.studentDetails.address.pincode}`}
                            {selectedApplicant.studentId.studentDetails.address.country && `, ${selectedApplicant.studentId.studentDetails.address.country}`}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Area of Interest */}
                {selectedApplicant.studentId?.studentDetails?.areaOfInterest && selectedApplicant.studentId.studentDetails.areaOfInterest.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Areas of Interest
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedApplicant.studentId.studentDetails.areaOfInterest.map((area, index) => (
                          <Chip key={index} label={area} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Application Details */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Application Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Job Position:</strong> {selectedApplicant.jobId?.title || 'Not specified'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Company:</strong> {selectedApplicant.jobId?.companyName || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Applied Date:</strong> {selectedApplicant.appliedAt ? format(new Date(selectedApplicant.appliedAt), 'MMM dd, yyyy HH:mm') : 'Not specified'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Current Status:</strong> 
                          <Chip 
                            label={selectedApplicant.status || 'Unknown'} 
                            color={getStatusColor(selectedApplicant.status || 'Unknown') as any} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Grid>
                      {selectedApplicant.shortlistedAt && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Shortlisted Date:</strong> {format(new Date(selectedApplicant.shortlistedAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Grid>
                      )}
                      {selectedApplicant.offeredAt && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Offered Date:</strong> {format(new Date(selectedApplicant.offeredAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>

                {/* Academic Documents */}
                {selectedApplicant.studentId?.studentDetails && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Academic Documents
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedApplicant.studentId.studentDetails.tenthMarks?.marksheet && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                10th Marksheet
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Percentage: {selectedApplicant.studentId.studentDetails.tenthMarks.percentage || 'N/A'}%
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => window.open(`http://localhost:5000${selectedApplicant.studentId.studentDetails.tenthMarks.marksheet}`, '_blank')}
                              >
                                View Document
                              </Button>
                            </Box>
                          </Grid>
                        )}
                        {selectedApplicant.studentId.studentDetails.twelfthMarks?.marksheet && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                12th Marksheet
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Percentage: {selectedApplicant.studentId.studentDetails.twelfthMarks.percentage || 'N/A'}%
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => window.open(`http://localhost:5000${selectedApplicant.studentId.studentDetails.twelfthMarks.marksheet}`, '_blank')}
                              >
                                View Document
                              </Button>
                            </Box>
                          </Grid>
                        )}
                        {selectedApplicant.studentId.studentDetails.lastSemesterMarksheet && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Last Semester Marksheet
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => window.open(`http://localhost:5000${selectedApplicant.studentId.studentDetails.lastSemesterMarksheet}`, '_blank')}
                              >
                                View Document
                              </Button>
                            </Box>
                          </Grid>
                        )}
                        {!selectedApplicant.studentId.studentDetails.tenthMarks?.marksheet && 
                         !selectedApplicant.studentId.studentDetails.twelfthMarks?.marksheet && 
                         !selectedApplicant.studentId.studentDetails.lastSemesterMarksheet && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              No academic documents uploaded by this student.
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Resume Preview */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Resume Preview
                    </Typography>
                    {resumeLoading ? (
                      <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                      </Box>
                    ) : resumeData ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Resume is available for download. Click the "Download Resume" button above to view the complete resume.
                        </Typography>
                        <Typography variant="body2">
                          <strong>Last Updated:</strong> {format(new Date(resumeData.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No resume available for this student.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        {actionApplicant?.status === 'Applied' && (
          <MenuItem onClick={() => handleShortlist(actionApplicant)}>
            <ListItemIcon>
              <Star />
            </ListItemIcon>
            <ListItemText>Shortlist</ListItemText>
          </MenuItem>
        )}
        {actionApplicant?.status === 'Shortlisted' && (
          <MenuItem onClick={() => handleOffer(actionApplicant)}>
            <ListItemIcon>
              <Work />
            </ListItemIcon>
            <ListItemText>Offer Position</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ManageApplicants;
