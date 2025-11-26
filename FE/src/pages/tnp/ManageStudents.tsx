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
  Checkbox,
  FormControlLabel,
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
  PictureAsPdf,
  Description,
  GetApp,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFilterType, setExportFilterType] = useState<'verification' | 'course' | 'placement'>('verification');
  const [exportVerificationValue, setExportVerificationValue] = useState<'Verified' | 'Unverified'>('Verified');
  const [exportPlacementValue, setExportPlacementValue] = useState<'Placed' | 'Not Placed' | 'Shortlisted'>('Placed');
  const [exportCourseValues, setExportCourseValues] = useState<string[]>([]);
  const [exportWithAcademic, setExportWithAcademic] = useState(false);
  const [exportIncludeSkills, setExportIncludeSkills] = useState(false);

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

  const handleExport = () => {
    let targetedStudents = [...students];

    if (exportFilterType === 'verification') {
      targetedStudents = targetedStudents.filter((student) =>
        exportVerificationValue === 'Verified'
          ? student.studentDetails?.isVerified
          : !student.studentDetails?.isVerified
      );
    } else if (exportFilterType === 'placement') {
      if (exportPlacementValue === 'Shortlisted') {
        targetedStudents = targetedStudents.filter(
          (student) => student.studentDetails?.placementStatus === 'Shortlisted'
        );
      } else {
        targetedStudents = targetedStudents.filter(
          (student) => student.studentDetails?.placementStatus === exportPlacementValue
        );
      }
    } else if (exportFilterType === 'course') {
      if (exportCourseValues.length === 0) {
        alert('Please select at least one course to export.');
        return;
      }
      targetedStudents = targetedStudents.filter((student) =>
        exportCourseValues.includes(student.studentDetails?.courseName || '')
      );
    }

    if (targetedStudents.length === 0) {
      alert('No student records match the selected filters.');
      return;
    }

    const rows = targetedStudents.map((student) => {
      const collegeName =
        typeof student.studentDetails?.college === 'object' && student.studentDetails?.college
          ? student.studentDetails.college.name
          : student.studentDetails?.college || 'N/A';
      const placementStatus = student.studentDetails?.placementStatus || 'Not Placed';
      const placementCompany =
        placementStatus === 'Placed'
          ? (student.studentDetails as any)?.placementCompany || 'Not specified'
          : '';

      const row: any = {
        ID: student.studentDetails?.registrationNumber || student._id,
        Name: student.fullName,
        Email: student.email,
        Phone: student.mobileNumber,
        Branch: student.studentDetails?.courseName || 'N/A',
        College: collegeName,
        'Verification Status': student.studentDetails?.isVerified ? 'Verified' : 'Unverified',
        'Placement Status': placementStatus,
        'Company Name': placementCompany,
        'Registration Date': new Date(student.createdAt).toLocaleDateString(),
      };

      if (exportWithAcademic) {
        row['Graduation Year'] = student.studentDetails?.yearOfCompletion || '';
        row['CGPA'] = student.studentDetails?.cgpa ?? '';
        row['10th Percentage'] = student.studentDetails?.tenthMarks?.percentage ?? '';
        row['12th Percentage'] = student.studentDetails?.twelfthMarks?.percentage ?? '';
        row['Application Status (Company)'] =
          placementStatus === 'Placed'
            ? `${placementStatus} (${placementCompany || 'Not specified'})`
            : placementStatus;
      }

      if (exportIncludeSkills) {
        const skills = ((student.studentDetails as any)?.skills || []).join(', ');
        row['Skills'] = skills;
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Records');
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `student-records-${timestamp}.xlsx`);
    setExportDialogOpen(false);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const courses = [
    'Computer Science',
    'Information Technology',
    'Artificial Intelligence',
    'AIML',
    'Data Science',
    'Cyber Security',
    'ENTC',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electronics Engineering',
    'Robotics',
    'Automation',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biomedical Engineering',
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <People sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Manage Students
        </Typography>
        <Box flexGrow={1} />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Download />}
              onClick={() => setExportDialogOpen(true)}
            >
              Export Records
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/tnp/dashboard'}
            >
              Back to Dashboard
            </Button>
          </Stack>
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

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Student Records</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Choose a filter to export students who meet the criteria.
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={exportFilterType}
                label="Filter Type"
                onChange={(e) => setExportFilterType(e.target.value as typeof exportFilterType)}
              >
                <MenuItem value="verification">Verification Status</MenuItem>
                <MenuItem value="course">Course</MenuItem>
                <MenuItem value="placement">Placement Status</MenuItem>
              </Select>
            </FormControl>

            {exportFilterType === 'verification' && (
              <FormControl fullWidth>
                <InputLabel>Verification Status</InputLabel>
                <Select
                  value={exportVerificationValue}
                  label="Verification Status"
                  onChange={(e) => setExportVerificationValue(e.target.value as typeof exportVerificationValue)}
                >
                  <MenuItem value="Verified">Verified</MenuItem>
                  <MenuItem value="Unverified">Unverified</MenuItem>
                </Select>
              </FormControl>
            )}

            {exportFilterType === 'placement' && (
              <FormControl fullWidth>
                <InputLabel>Placement Status</InputLabel>
                <Select
                  value={exportPlacementValue}
                  label="Placement Status"
                  onChange={(e) => setExportPlacementValue(e.target.value as typeof exportPlacementValue)}
                >
                  <MenuItem value="Placed">Placed</MenuItem>
                  <MenuItem value="Not Placed">Not Placed</MenuItem>
                  <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                </Select>
              </FormControl>
            )}

            {exportFilterType === 'course' && (
              <FormControl fullWidth>
                <InputLabel>Courses</InputLabel>
                <Select
                  multiple
                  value={exportCourseValues}
                  label="Courses"
                  onChange={(e) => setExportCourseValues(e.target.value as string[])}
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {courses.map((course) => (
                    <MenuItem key={course} value={course}>
                      <Checkbox checked={exportCourseValues.indexOf(course) > -1} />
                      <Typography variant="body2">{course}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={exportWithAcademic}
                  onChange={(e) => setExportWithAcademic(e.target.checked)}
                />
              }
              label="Export with academic details"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportIncludeSkills}
                  onChange={(e) => setExportIncludeSkills(e.target.checked)}
                />
              }
              label="Include skills"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            Download Excel
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
                            <Box display="flex" gap={1} mt={1}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleFileView(viewingStudent.studentDetails?.tenthMarks?.marksheet!)}
                                color="info"
                                variant="outlined"
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.tenthMarks?.marksheet}`, '_blank')}
                              >
                                Download
                              </Button>
                            </Box>
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
                            <Box display="flex" gap={1} mt={1}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleFileView(viewingStudent.studentDetails?.twelfthMarks?.marksheet!)}
                                color="info"
                                variant="outlined"
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.twelfthMarks?.marksheet}`, '_blank')}
                              >
                                Download
                              </Button>
                            </Box>
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
                            <Box display="flex" gap={1} mt={1}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleFileView(viewingStudent.studentDetails?.lastSemesterMarksheet!)}
                                color="info"
                                variant="outlined"
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.lastSemesterMarksheet}`, '_blank')}
                              >
                                Download
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Resume Section */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Resume
                    </Typography>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Resume:</strong> {viewingStudent.studentDetails?.resume ? 'Available' : 'Not uploaded'}
                      </Typography>
                      {viewingStudent.studentDetails?.resume ? (
                        <Box display="flex" gap={1} mt={1}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleFileView(viewingStudent.studentDetails?.resume!)}
                            sx={{ mt: 1 }}
                            color="info"
                            variant="outlined"
                          >
                            View Resume
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Description />}
                            onClick={() => window.open(`http://localhost:5000${viewingStudent.studentDetails?.resume}`, '_blank')}
                            sx={{ mt: 1 }}
                            color="primary"
                          >
                            Download Resume
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Student has not uploaded a resume yet.
                        </Typography>
                      )}
                    </Box>
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
