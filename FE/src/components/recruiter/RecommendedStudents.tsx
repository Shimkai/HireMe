import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

interface RecommendedStudent {
  student_id: string;
  name: string;
  branch: string;
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  match_score: number;
  skill_overlap: number;
  skills: string[];
  reason: string;
  applicationStatus?: string;
}

interface RecommendedStudentsProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

const RecommendedStudents: React.FC<RecommendedStudentsProps> = ({ jobId, open, onClose }) => {
  const [students, setStudents] = useState<RecommendedStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [placing, setPlacing] = useState(false);
  const [placedStudentId, setPlacedStudentId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<RecommendedStudent | null>(null);

  useEffect(() => {
    if (open && jobId) {
      fetchRecommendations();
      fetchApplicationStatuses();
    }
  }, [open, jobId]);

  const fetchApplicationStatuses = async () => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      const applications = response.data?.data || response.data || [];
      
      const shortlisted = new Set<string>();
      const placed = new Set<string>();
      
      applications.forEach((app: any) => {
        const studentId = app.studentId?._id || app.studentId;
        if (app.status === 'Shortlisted') {
          shortlisted.add(studentId);
        } else if (app.status === 'Accepted' || app.status === 'Offered') {
          placed.add(studentId);
          setPlacedStudentId(studentId);
        }
      });
      
      setShortlistedIds(shortlisted);
    } catch (err: any) {
      console.error('Error fetching application statuses:', err);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/recommendations/job/${jobId}?top_k=30`);
      console.log('Full recommendation response:', response);
      console.log('Recommendation data:', response.data);
      
      // Handle different response structures
      let studentsData = [];
      
      if (response.data && response.data.success && response.data.data) {
        // Structure: { success: true, data: [...], message: "..." }
        studentsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Structure: [...]
        studentsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Structure: { data: [...] }
        studentsData = response.data.data;
      }
      
      console.log('Parsed students data:', studentsData);
      console.log('Number of students:', studentsData.length);
      
      setStudents(studentsData);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (studentId: string) => {
    try {
      const response = await api.post('/recommendations/shortlist', {
        jobId,
        studentId,
      });
      
      console.log('Shortlist response:', response);
      setShortlistedIds(prev => new Set([...prev, studentId]));
      
      // Show success notification if available
      if (window.confirm) {
        // For now, just update state
      }
    } catch (err: any) {
      console.error('Error shortlisting student:', err);
      alert(err.response?.data?.message || 'Failed to shortlist student');
    }
  };

  const handlePlace = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to accept/place this student for this job?')) {
      return;
    }

    setPlacing(true);
    try {
      await api.post('/recommendations/place', {
        jobId,
        studentId,
      });
      
      setPlacedStudentId(studentId);
      alert('Student accepted/placed successfully!');
      onClose();
    } catch (err: any) {
      console.error('Error placing student:', err);
      alert(err.response?.data?.message || 'Failed to place student. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'default';
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6">Recommended Students</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && students.length === 0 && (
            <Alert severity="info">
              No students match the job requirements.
            </Alert>
          )}

          {!loading && students.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>CGPA</TableCell>
                    <TableCell>10th %</TableCell>
                    <TableCell>12th %</TableCell>
                    <TableCell>Match Score</TableCell>
                    <TableCell>Skill Overlap</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {shortlistedIds.has(student.student_id) && (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            {student.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{student.branch}</TableCell>
                      <TableCell>{student.cgpa}</TableCell>
                      <TableCell>{student.tenth_percentage}%</TableCell>
                      <TableCell>{student.twelfth_percentage}%</TableCell>
                      <TableCell>
                        <Chip
                          label={`${student.match_score}%`}
                          color={getMatchColor(student.match_score)}
                          size="small"
                          icon={<TrendingUpIcon />}
                        />
                      </TableCell>
                      <TableCell>{student.skill_overlap}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewingStudent(student)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {placedStudentId === student.student_id && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled
                            >
                              Placed/Accepted
                            </Button>
                          )}
                          {placedStudentId !== student.student_id && !shortlistedIds.has(student.student_id) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleShortlist(student.student_id)}
                            >
                              Shortlist
                            </Button>
                          )}
                          {placedStudentId !== student.student_id && shortlistedIds.has(student.student_id) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              disabled={placing}
                              onClick={() => handlePlace(student.student_id)}
                            >
                              {placing ? <CircularProgress size={20} /> : 'Place / Accept'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Student Details Modal */}
      {viewingStudent && (
        <Dialog open={!!viewingStudent} onClose={() => setViewingStudent(null)} maxWidth="md" fullWidth>
          <DialogTitle>Student Details - {viewingStudent.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Match Score: {viewingStudent.match_score}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reason: {viewingStudent.reason}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Academic Information
              </Typography>
              <Typography variant="body2">Branch: {viewingStudent.branch}</Typography>
              <Typography variant="body2">CGPA: {viewingStudent.cgpa}</Typography>
              <Typography variant="body2">10th Percentage: {viewingStudent.tenth_percentage}%</Typography>
              <Typography variant="body2">12th Percentage: {viewingStudent.twelfth_percentage}%</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Skills ({viewingStudent.skills.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {viewingStudent.skills.map((skill, idx) => (
                  <Chip key={idx} label={skill} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Recommendation Details
              </Typography>
              <LinearProgress
                variant="determinate"
                value={viewingStudent.match_score}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                {viewingStudent.skill_overlap}% skills match job requirements
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewingStudent(null)}>Close</Button>
            {!shortlistedIds.has(viewingStudent.student_id) && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleShortlist(viewingStudent.student_id);
                  setViewingStudent(null);
                }}
              >
                Shortlist Student
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default RecommendedStudents;

