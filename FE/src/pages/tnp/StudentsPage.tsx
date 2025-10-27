import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, Avatar } from '@mui/material';
import { Add, Edit, Delete, Visibility, CheckCircle, Cancel, Close, Download, Description, PictureAsPdf } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types';

const StudentsPage = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [verificationReason, setVerificationReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, courseFilter, verifiedFilter, placementFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (courseFilter) params.course = courseFilter;
      if (verifiedFilter !== '') params.verified = verifiedFilter;
      if (placementFilter) params.placement = placementFilter;
      
      const response = await userService.getStudents(params);
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = (filePath: string, fileName: string) => {
    if (!filePath) {
      alert('No file available for download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = `http://localhost:5000${filePath}`;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileView = (filePath: string) => {
    if (!filePath) {
      alert('No file available for viewing');
      return;
    }
    
    // Open file in new tab for viewing
    window.open(`http://localhost:5000${filePath}`, '_blank');
  };

  const handleVerifyClick = (student: User) => {
    setSelectedStudent(student);
    setVerificationReason('');
    setActionError('');
    setVerifyDialogOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (!selectedStudent) return;

    try {
      setProcessing(true);
      setActionError('');
      
      await userService.verifyStudent(selectedStudent._id, true, verificationReason);
      
      setVerifyDialogOpen(false);
      setSelectedStudent(null);
      setVerificationReason('');
      
      // Refresh the students list
      fetchStudents();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to verify student');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnverifyStudent = async (student: User) => {
    if (!confirm(`Are you sure you want to unverify ${student.fullName}?`)) return;

    try {
      await userService.verifyStudent(student._id, false, 'Unverified by TnP');
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to unverify student');
    }
  };

  const handleDeleteStudent = async (student: User) => {
    if (!confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) return;

    try {
      await userService.deleteStudent(student._id);
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete student');
    }
  };

  const handleCloseDialog = () => {
    setVerifyDialogOpen(false);
    setSelectedStudent(null);
    setVerificationReason('');
    setActionError('');
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Manage Students
          </Typography>
          <Button variant="contained" startIcon={<Add />}>
            Add Student
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    label="Course"
                  >
                    <MenuItem value="">All Courses</MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Information Technology">Information Technology</MenuItem>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Mechanical">Mechanical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Verification Status</InputLabel>
                  <Select
                    value={verifiedFilter}
                    onChange={(e) => setVerifiedFilter(e.target.value)}
                    label="Verification Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Verified</MenuItem>
                    <MenuItem value="false">Unverified</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Placement Status</InputLabel>
                  <Select
                    value={placementFilter}
                    onChange={(e) => setPlacementFilter(e.target.value)}
                    label="Placement Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Not Placed">Not Placed</MenuItem>
                    <MenuItem value="Placed">Placed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {students.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {students.filter(s => s.studentDetails?.isVerified).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Verified Students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main">
                      {students.filter(s => s.studentDetails?.placementStatus === 'Placed').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Placed Students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {students.filter(s => !s.studentDetails?.isVerified).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Verification
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Student Records
                </Typography>
                {students.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No students found
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Course</TableCell>
                          <TableCell>Year</TableCell>
                          <TableCell>CGPA</TableCell>
                          <TableCell>Verification</TableCell>
                          <TableCell>Placement</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>{student.fullName}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.studentDetails?.courseName || 'N/A'}</TableCell>
                            <TableCell>{student.studentDetails?.yearOfCompletion || 'N/A'}</TableCell>
                            <TableCell>{student.studentDetails?.cgpa || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={student.studentDetails?.isVerified ? 'Verified' : 'Unverified'} 
                                color={student.studentDetails?.isVerified ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={student.studentDetails?.placementStatus || 'Not Placed'} 
                                color={student.studentDetails?.placementStatus === 'Placed' ? 'info' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  setViewingStudent(student);
                                  setProfileDialogOpen(true);
                                }}
                                title="View Full Profile"
                              >
                                <Visibility />
                              </IconButton>
                              {!student.studentDetails?.isVerified ? (
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleVerifyClick(student)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              ) : (
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleUnverifyStudent(student)}
                                >
                                  <Cancel />
                                </IconButton>
                              )}
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteStudent(student)}
                              >
                                <Delete />
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

        {/* Verification Dialog */}
        <Dialog open={verifyDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Verify Student</DialogTitle>
          <DialogContent>
            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionError}
              </Alert>
            )}
            
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to verify {selectedStudent?.fullName}?
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              This will allow the student to apply for jobs and access all student features.
            </Typography>

            <TextField
              fullWidth
              label="Verification Notes (Optional)"
              multiline
              rows={3}
              value={verificationReason}
              onChange={(e) => setVerificationReason(e.target.value)}
              placeholder="Add any notes about this verification..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifySubmit} 
              variant="contained" 
              color="success"
              disabled={processing}
            >
              {processing ? <CircularProgress size={20} /> : 'Verify Student'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Student Profile View Dialog */}
        <Dialog
          open={profileDialogOpen}
          onClose={() => {
            setProfileDialogOpen(false);
            setViewingStudent(null);
          }}
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
                    {viewingStudent.fullName.charAt(0)}
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
                          <strong>Course:</strong> {viewingStudent.studentDetails?.courseName}
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
                              <strong>Address:</strong> {viewingStudent.studentDetails.address.street || 'Not specified'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>City:</strong> {viewingStudent.studentDetails.address.city || 'Not specified'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>State:</strong> {viewingStudent.studentDetails.address.state || 'Not specified'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Pincode:</strong> {viewingStudent.studentDetails.address.pincode || 'Not specified'}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Academic Performance */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Academic Performance
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>10th Percentage:</strong> {viewingStudent.studentDetails?.tenthMarks?.percentage || 'Not specified'}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>12th Percentage:</strong> {viewingStudent.studentDetails?.twelfthMarks?.percentage || 'Not specified'}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Current CGPA:</strong> {viewingStudent.studentDetails?.cgpa || 'Not specified'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Skills and Interests */}
                  {viewingStudent.studentDetails?.areaOfInterest && viewingStudent.studentDetails.areaOfInterest.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          Skills & Interests
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {viewingStudent.studentDetails.areaOfInterest.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}

                  {/* Uploaded Documents */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Uploaded Documents
                      </Typography>
                      <Grid container spacing={2}>
                        {/* Resume */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Description color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Resume
                              </Typography>
                            </Box>
                            {viewingStudent.studentDetails?.resume ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                  Resume.pdf
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleFileView(viewingStudent.studentDetails!.resume!)}
                                  title="View Resume"
                                >
                                  <Visibility />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleFileDownload(
                                    viewingStudent.studentDetails!.resume!,
                                    `${viewingStudent.fullName}_Resume.pdf`
                                  )}
                                  title="Download Resume"
                                >
                                  <Download />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No resume uploaded
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        {/* 10th Marksheet */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <PictureAsPdf color="error" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                10th Marksheet
                              </Typography>
                            </Box>
                            {viewingStudent.studentDetails?.tenthMarks?.marksheet ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                  10th_Marksheet.pdf
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleFileView(viewingStudent.studentDetails!.tenthMarks!.marksheet!)}
                                  title="View 10th Marksheet"
                                >
                                  <Visibility />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleFileDownload(
                                    viewingStudent.studentDetails!.tenthMarks!.marksheet!,
                                    `${viewingStudent.fullName}_10th_Marksheet.pdf`
                                  )}
                                  title="Download 10th Marksheet"
                                >
                                  <Download />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No 10th marksheet uploaded
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        {/* 12th Marksheet */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <PictureAsPdf color="error" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                12th Marksheet
                              </Typography>
                            </Box>
                            {viewingStudent.studentDetails?.twelfthMarks?.marksheet ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                  12th_Marksheet.pdf
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleFileView(viewingStudent.studentDetails!.twelfthMarks!.marksheet!)}
                                  title="View 12th Marksheet"
                                >
                                  <Visibility />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleFileDownload(
                                    viewingStudent.studentDetails!.twelfthMarks!.marksheet!,
                                    `${viewingStudent.fullName}_12th_Marksheet.pdf`
                                  )}
                                  title="Download 12th Marksheet"
                                >
                                  <Download />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No 12th marksheet uploaded
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        {/* Last Semester Marksheet */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <PictureAsPdf color="error" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Last Semester Marksheet
                              </Typography>
                            </Box>
                            {viewingStudent.studentDetails?.lastSemesterMarksheet ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                  Last_Semester_Marksheet.pdf
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleFileView(viewingStudent.studentDetails!.lastSemesterMarksheet!)}
                                  title="View Last Semester Marksheet"
                                >
                                  <Visibility />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleFileDownload(
                                    viewingStudent.studentDetails!.lastSemesterMarksheet!,
                                    `${viewingStudent.fullName}_Last_Semester_Marksheet.pdf`
                                  )}
                                  title="Download Last Semester Marksheet"
                                >
                                  <Download />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No last semester marksheet uploaded
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProfileDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default StudentsPage;
