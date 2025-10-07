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
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Grid,
} from '@mui/material';
import {
  People,
  CheckCircle,
  Cancel,
  FilterList,
  Search,
  Visibility,
  Download,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

interface Student {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  profileAvatar?: string;
  studentDetails: {
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
}

const ManageStudents: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [verificationData, setVerificationData] = useState({
    isVerified: false,
    reason: '',
  });
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Debug logging for dialog state
  useEffect(() => {
    console.log('Profile dialog state changed:', profileDialogOpen);
    console.log('Viewing student:', viewingStudent?.fullName);
  }, [profileDialogOpen, viewingStudent]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getStudents({ limit: 100 });
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async () => {
    if (!selectedStudent) return;

    try {
      await userService.verifyStudent(selectedStudent._id, verificationData);
      setVerifyDialogOpen(false);
      setSelectedStudent(null);
      setVerificationData({ isVerified: false, reason: '' });
      fetchStudents();
      alert(`Student ${verificationData.isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update student verification');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'success';
      case 'Not Placed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getVerificationColor = (isVerified: boolean) => {
    return isVerified ? 'success' : 'warning';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentDetails?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || student.studentDetails?.placementStatus === statusFilter;
    const matchesCourse = !courseFilter || student.studentDetails?.courseName === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const paginatedStudents = filteredStudents.slice(
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

  const courses = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Business Administration',
    'Commerce',
    'Arts',
    'Science',
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <People sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Manage Students
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          onClick={() => {
            console.log('Test dialog opening');
            setViewingStudent(students[0] || null);
            setProfileDialogOpen(true);
          }}
          sx={{ mr: 1 }}
        >
          Test Dialog
        </Button>
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
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FilterList color="action" />
          <TextField
            size="small"
            label="Search Students"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              label="Filter by Status"
            >
              <MenuItem value="">All Students</MenuItem>
              <MenuItem value="Placed">Placed</MenuItem>
              <MenuItem value="Not Placed">Not Placed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Course</InputLabel>
            <Select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(0);
              }}
              label="Filter by Course"
            >
              <MenuItem value="">All Courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course} value={course}>
                  {course}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Students Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Students will appear here once they register.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>CGPA</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Placement Status</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {student.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {student.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {student.mobileNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {student.studentDetails?.courseName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.studentDetails?.yearOfCompletion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {student.studentDetails?.cgpa || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.studentDetails?.isVerified ? 'Verified' : 'Unverified'}
                        color={getVerificationColor(student.studentDetails?.isVerified || false) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.studentDetails?.placementStatus || 'Not Placed'}
                        color={getStatusColor(student.studentDetails?.placementStatus || 'Not Placed') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            console.log('Opening profile for student:', student.fullName);
                            setViewingStudent(student);
                            setProfileDialogOpen(true);
                          }}
                          title="View Full Profile"
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setVerificationData({
                              isVerified: !student.studentDetails?.isVerified,
                              reason: '',
                            });
                            setVerifyDialogOpen(true);
                          }}
                          title={student.studentDetails?.isVerified ? 'Unverify Student' : 'Verify Student'}
                          color={student.studentDetails?.isVerified ? 'error' : 'success'}
                        >
                          {student.studentDetails?.isVerified ? <Cancel /> : <CheckCircle />}
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
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Verification Dialog */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {verificationData.isVerified ? 'Verify Student' : 'Unverify Student'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {verificationData.isVerified ? 'Verify' : 'Unverify'} student: <strong>{selectedStudent?.fullName}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Reason (Optional)"
            value={verificationData.reason}
            onChange={(e) => setVerificationData(prev => ({ ...prev, reason: e.target.value }))}
            multiline
            rows={3}
            placeholder="Add a reason for verification status change..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVerifyStudent}
            variant="contained"
            color={verificationData.isVerified ? 'success' : 'error'}
          >
            {verificationData.isVerified ? 'Verify Student' : 'Unverify Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Profile View Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => {
          console.log('Closing profile dialog');
          setProfileDialogOpen(false);
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
                        {viewingStudent.studentDetails.areaOfInterest.map((area, index) => (
                          <Chip key={index} label={area} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Account Information */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Account Information
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Typography variant="body2">
                        <strong>Registration Date:</strong> {new Date(viewingStudent.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Student ID:</strong> {viewingStudent._id}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
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

export default ManageStudents;
