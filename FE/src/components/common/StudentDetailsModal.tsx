import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Link,
} from '@mui/material';
import {
  Close,
  Person,
  School,
  Work,
  Download,
  Visibility,
  Assignment,
  Grade,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { resumeService } from '../../services/resumeService';
import { User } from '../../types';

interface StudentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  student: User | null;
  applicationData?: {
    status: string;
    appliedAt: string;
    jobTitle?: string;
    companyName?: string;
  };
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  open,
  onClose,
  student,
  applicationData,
}) => {
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && student?._id) {
      fetchResumeData();
    }
  }, [open, student]);

  const fetchResumeData = async () => {
    if (!student?._id) return;
    
    try {
      setResumeLoading(true);
      setError(null);
      const response = await resumeService.getStudentResume(student._id);
      setResumeData(response.data);
    } catch (err) {
      console.error('Failed to fetch resume:', err);
      setResumeData(null);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!student?._id) return;
    
    try {
      const response = await resumeService.generateResumePDF(student._id);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.fullName || 'Student'}_Resume.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download resume');
    }
  };

  const handleDownloadFile = (filePath: string, fileName: string) => {
    if (!filePath) return;
    
    try {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${filePath}`;
      link.download = fileName;
      link.target = '_blank';
      link.click();
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleViewFile = (filePath: string) => {
    if (!filePath) return;
    window.open(`http://localhost:5000${filePath}`, '_blank');
  };

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

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pincode,
      address.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  if (!student) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Person color="primary" />
          <Typography variant="h6">
            Student Details - {student.fullName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ p: 2 }}>
          {/* Profile Header */}
          <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                src={student.profileAvatar ? `http://localhost:5000${student.profileAvatar}` : undefined}
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {student.fullName?.charAt(0) || 'U'}
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="h5" gutterBottom>
                  {student.fullName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {student.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.mobileNumber}
                </Typography>
                {applicationData && (
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={applicationData.status}
                      color={getStatusColor(applicationData.status) as any}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownloadResume}
                  disabled={!resumeData || resumeLoading}
                  sx={{ mb: 1 }}
                >
                  {resumeLoading ? 'Loading...' : 'Download Resume'}
                </Button>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                  <Person />
                  Personal Information
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography variant="body2">
                    <strong>Full Name:</strong> {student.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {student.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone Number:</strong> {student.mobileNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {formatAddress(student.studentDetails?.address)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Education Details */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                  <School />
                  Education Details
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography variant="body2">
                    <strong>Degree:</strong> {student.studentDetails?.courseName || 'Not specified'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>College:</strong> {
                      student.studentDetails?.college 
                        ? (typeof student.studentDetails.college === 'object' 
                            ? student.studentDetails.college?.name || 'Not specified'
                            : student.studentDetails.college)
                        : 'Not specified'
                    }
                  </Typography>
                  <Typography variant="body2">
                    <strong>Branch:</strong> {student.studentDetails?.courseName || 'Not specified'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>CGPA:</strong> {student.studentDetails?.cgpa || 'Not specified'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Passing Year:</strong> {student.studentDetails?.yearOfCompletion || 'Not specified'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Registration Number:</strong> {student.studentDetails?.registrationNumber || 'Not assigned'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Skills */}
            {student.studentDetails?.skills && student.studentDetails.skills.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                    <Work />
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {student.studentDetails.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Area of Interest */}
            {student.studentDetails?.areaOfInterest && student.studentDetails.areaOfInterest.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                    <Grade />
                    Areas of Interest
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {student.studentDetails.areaOfInterest.map((area, index) => (
                      <Chip key={index} label={area} size="small" color="secondary" variant="outlined" />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Academic Documents */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                  <Assignment />
                  Academic Documents
                </Typography>
                <Grid container spacing={2}>
                  {/* 10th Marksheet */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        10th Marksheet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Percentage: {student.studentDetails?.tenthMarks?.percentage || 'N/A'}%
                      </Typography>
                      {student.studentDetails?.tenthMarks?.marksheet ? (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewFile(student.studentDetails!.tenthMarks!.marksheet!)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleDownloadFile(
                              student.studentDetails!.tenthMarks!.marksheet!,
                              `${student.fullName}_10th_Marksheet.pdf`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          File not uploaded
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* 12th Marksheet */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        12th Marksheet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Percentage: {student.studentDetails?.twelfthMarks?.percentage || 'N/A'}%
                      </Typography>
                      {student.studentDetails?.twelfthMarks?.marksheet ? (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewFile(student.studentDetails!.twelfthMarks!.marksheet!)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleDownloadFile(
                              student.studentDetails!.twelfthMarks!.marksheet!,
                              `${student.fullName}_12th_Marksheet.pdf`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          File not uploaded
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Last Semester Marksheet */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Last Semester Marksheet
                      </Typography>
                      {student.studentDetails?.lastSemesterMarksheet ? (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewFile(student.studentDetails!.lastSemesterMarksheet!)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleDownloadFile(
                              student.studentDetails!.lastSemesterMarksheet!,
                              `${student.fullName}_Last_Semester_Marksheet.pdf`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          File not uploaded
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Resume Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                  <Assignment />
                  Resume Information
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
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Resume not uploaded
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Application Details */}
            {applicationData && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                    <CalendarToday />
                    Application Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Job Position:</strong> {applicationData.jobTitle || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Company:</strong> {applicationData.companyName || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Applied Date:</strong> {format(new Date(applicationData.appliedAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Current Status:</strong> 
                        <Chip 
                          label={applicationData.status} 
                          color={getStatusColor(applicationData.status) as any} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Projects */}
            {student.studentDetails?.projects && student.studentDetails.projects.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center" gap={1}>
                    <Work />
                    Projects
                  </Typography>
                  {student.studentDetails.projects.map((project, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.description}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Technologies:</strong> {project.technologies.join(', ')}
                      </Typography>
                      {project.duration && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Duration:</strong> {project.duration}
                        </Typography>
                      )}
                      <Box display="flex" gap={1} mt={1}>
                        {project.githubUrl && (
                          <Link href={project.githubUrl} target="_blank" rel="noopener">
                            GitHub
                          </Link>
                        )}
                        {project.liveUrl && (
                          <Link href={project.liveUrl} target="_blank" rel="noopener">
                            Live Demo
                          </Link>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailsModal;
