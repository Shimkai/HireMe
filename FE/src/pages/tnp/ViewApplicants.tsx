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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Search,
  Person,
  Email,
  School,
  Work,
} from '@mui/icons-material';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface StudentApplication {
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

interface StudentWithApplications {
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
  };
  totalApplications: number;
  applications: StudentApplication[];
}

const ViewApplicants: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithApplications | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, searchTerm, departmentFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all applications
      const response = await applicationService.getAllApplications({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      // Group applications by student
      const studentMap = new Map<string, StudentWithApplications>();
      
      response.data.forEach((application: StudentApplication) => {
        const studentId = application.studentId._id;
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            _id: application.studentId._id,
            fullName: application.studentId.fullName,
            email: application.studentId.email,
            mobileNumber: application.studentId.mobileNumber,
            profileAvatar: application.studentId.profileAvatar,
            studentDetails: application.studentId.studentDetails,
            totalApplications: 0,
            applications: [],
          });
        }
        
        const student = studentMap.get(studentId)!;
        student.applications.push(application);
        student.totalApplications++;
      });

      const studentsList = Array.from(studentMap.values());

      // Apply filters
      let filteredStudents = studentsList;

      if (searchTerm) {
        filteredStudents = filteredStudents.filter(student =>
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (departmentFilter !== 'All') {
        filteredStudents = filteredStudents.filter(student =>
          student.studentDetails.courseName === departmentFilter
        );
      }

      setStudents(filteredStudents);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = (student: StudentWithApplications) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
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

  const getUniqueDepartments = () => {
    const departments = new Set<string>();
    students.forEach(student => {
      if (student.studentDetails.courseName) {
        departments.add(student.studentDetails.courseName);
      }
    });
    return Array.from(departments).sort();
  };

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
        View Applicants
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
              placeholder="Search by name or email..."
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
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="All">All Departments</MenuItem>
                {getUniqueDepartments().map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Total Applications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No students found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No students have applied for jobs yet or match your search criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {student.studentDetails?.registrationNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={student.profileAvatar ? `http://localhost:5000${student.profileAvatar}` : undefined}
                        sx={{ width: 40, height: 40 }}
                      >
                        {student.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {student.fullName || 'Unknown Student'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.mobileNumber || 'No mobile'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.studentDetails?.courseName || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {typeof student.studentDetails?.college === 'object' 
                        ? student.studentDetails.college?.name || 'College not specified'
                        : student.studentDetails?.college || 'College not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.email || 'No email'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.totalApplications}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewApplications(student)}
                      title="View Applications"
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Application Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Application Status - {selectedStudent?.fullName}
          </Typography>
          <Button onClick={handleCloseModal} size="small">
            Close
          </Button>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedStudent && (
            <Box>
              {/* Student Details */}
              <Box display="flex" alignItems="center" gap={3} mb={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Avatar
                  src={selectedStudent.profileAvatar ? `http://localhost:5000${selectedStudent.profileAvatar}` : undefined}
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                >
                  {selectedStudent.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography variant="h5" gutterBottom>
                    {selectedStudent.fullName || 'Unknown Student'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {selectedStudent.email || 'No email'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedStudent.studentDetails?.courseName || 'Department not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CGPA: {selectedStudent.studentDetails?.cgpa || 'Not specified'}
                  </Typography>
                </Box>
              </Box>

              {/* Applications Table */}
              <Typography variant="h6" gutterBottom color="primary">
                Job Application History
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Job Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Applied Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStudent.applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {application.jobId?.companyName || 'Company Not Available'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {application.jobId?.title || 'Job Title Not Available'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status || 'Unknown'}
                            color={getStatusColor(application.status || 'Unknown') as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {application.appliedAt ? format(new Date(application.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ViewApplicants;
