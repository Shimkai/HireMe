import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add, Edit, Delete, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
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
                              <IconButton size="small" color="primary">
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
      </Container>
    </MainLayout>
  );
};

export default StudentsPage;
