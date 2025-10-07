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
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Work,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { jobService } from '../../services/jobService';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  designation: string;
  status: string;
  applicationDeadline: string;
  applicationCount: number;
  createdAt: string;
  description?: string;
  skillsRequired?: string[];
  eligibility?: {
    minCGPA?: number;
    allowedCourses?: string[];
    maxBacklogs?: number;
    yearOfCompletion?: number[];
  };
  ctc: {
    min: number;
    max: number;
    currency: string;
  };
  experienceRequired?: string;
  jobCategory?: string;
  workMode?: string;
  interviewProcess?: {
    rounds: Array<{
      type: string;
      description: string;
      duration: string;
    }>;
    totalRounds: number;
  };
}

const ManageJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Edit form data
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    designation: '',
    skillsRequired: [] as string[],
    eligibility: {
      minCGPA: '',
      allowedCourses: [] as string[],
      maxBacklogs: 0,
      yearOfCompletion: [] as number[],
    },
    ctc: {
      min: '',
      max: '',
      currency: 'INR',
    },
    experienceRequired: 'Fresher',
    applicationDeadline: '',
    jobCategory: 'Technical',
    workMode: 'Work from Office',
  });

  // Constants for dropdowns
  const jobTypes = ['Full-time', 'Internship', 'Part-time'];
  const jobCategories = ['Technical', 'Non-Technical', 'Research', 'Management'];
  const workModes = ['Work from Office', 'Work from Home', 'Hybrid'];
  const experienceLevels = ['Fresher', '0-1 years', '1-2 years', '2+ years'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getAllJobs({ limit: 100 });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      await jobService.deleteJob(selectedJob._id);
      setJobs(jobs.filter(job => job._id !== selectedJob._id));
      setDeleteDialogOpen(false);
      setSelectedJob(null);
      alert('Job deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete job');
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setEditError(null);
    setEditSuccess(null);
    
    // Populate edit form with job data
    setEditData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      designation: job.designation || '',
      skillsRequired: job.skillsRequired || [],
      eligibility: {
        minCGPA: job.eligibility?.minCGPA?.toString() || '',
        allowedCourses: job.eligibility?.allowedCourses || [],
        maxBacklogs: job.eligibility?.maxBacklogs || 0,
        yearOfCompletion: job.eligibility?.yearOfCompletion || [],
      },
      ctc: {
        min: job.ctc?.min?.toString() || '',
        max: job.ctc?.max?.toString() || '',
        currency: job.ctc?.currency || 'INR',
      },
      experienceRequired: job.experienceRequired || 'Fresher',
      applicationDeadline: job.applicationDeadline ? format(new Date(job.applicationDeadline), 'yyyy-MM-dd') : '',
      jobCategory: job.jobCategory || 'Technical',
      workMode: job.workMode || 'Work from Office',
    });
    
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditData(prev => ({
      ...prev,
      skillsRequired: skills,
    }));
  };

  const handleCoursesChange = (value: string) => {
    const courses = value.split(',').map(course => course.trim()).filter(course => course);
    setEditData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        allowedCourses: courses,
      },
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedJob) return;

    try {
      setEditLoading(true);
      setEditError(null);
      setEditSuccess(null);

      // Validate required fields
      if (!editData.title || !editData.description || !editData.location || !editData.designation) {
        setEditError('Please fill in all required fields');
        return;
      }

      if (!editData.applicationDeadline) {
        setEditError('Please select an application deadline');
        return;
      }

      if (new Date(editData.applicationDeadline) <= new Date()) {
        setEditError('Application deadline must be in the future');
        return;
      }

      if (!editData.ctc.min || !editData.ctc.max) {
        setEditError('Please specify CTC range');
        return;
      }

      if (parseFloat(editData.ctc.min) >= parseFloat(editData.ctc.max)) {
        setEditError('Minimum CTC must be less than maximum CTC');
        return;
      }

      // Prepare data for API
      const updateData = {
        ...editData,
        eligibility: {
          ...editData.eligibility,
          minCGPA: editData.eligibility.minCGPA ? parseFloat(editData.eligibility.minCGPA) : undefined,
        },
        ctc: {
          ...editData.ctc,
          min: parseFloat(editData.ctc.min),
          max: parseFloat(editData.ctc.max),
        },
      };

      await jobService.updateJob(selectedJob._id, updateData);
      
      // Update the jobs list
      setJobs(jobs.map(job => 
        job._id === selectedJob._id 
          ? { ...job, ...updateData }
          : job
      ));
      
      setEditSuccess('Job updated successfully!');
      setEditDialogOpen(false);
      
      // Refresh the jobs list
      setTimeout(() => {
        fetchJobs();
      }, 1000);
      
    } catch (err: any) {
      setEditError(err.response?.data?.error?.message || 'Failed to update job');
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canEditJob = (job: Job) => {
    return job.status === 'Pending' || job.status === 'Rejected';
  };

  const canDeleteJob = (job: Job) => {
    return job.applicationCount === 0;
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedJobs = jobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Work sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Manage Jobs
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          onClick={fetchJobs}
          sx={{ mr: 2 }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/recruiter/post-job'}
        >
          Post New Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You haven't posted any jobs yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/recruiter/post-job'}
          >
            Post Your First Job
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>CTC Range</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applications</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedJobs.map((job) => (
                  <TableRow key={job._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.designation}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>
                      {formatCurrency(job.ctc.min)} - {formatCurrency(job.ctc.max)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {job.applicationCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
                      </Typography>
                      {new Date(job.applicationDeadline) < new Date() && (
                        <Chip
                          label="Expired"
                          color="error"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewJob(job)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        {canEditJob(job) && (
                          <IconButton
                            size="small"
                            onClick={() => handleEditJob(job)}
                            title="Edit Job"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {canDeleteJob(job) && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedJob(job);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Job"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
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
            count={jobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this job posting?
          </Typography>
          <Typography variant="h6" gutterBottom>
            {selectedJob?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteJob}
            color="error"
            variant="contained"
          >
            Delete Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Details View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Work color="primary" />
            <Typography variant="h6">
              {selectedJob?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Job Information
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Typography variant="body2">
                        <strong>Company:</strong> {selectedJob.companyName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Designation:</strong> {selectedJob.designation}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {selectedJob.location}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Job Type:</strong> {selectedJob.jobType}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> 
                        <Chip
                          label={selectedJob.status}
                          color={getStatusColor(selectedJob.status) as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Compensation & Applications
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Typography variant="body2">
                        <strong>CTC Range:</strong> {formatCurrency(selectedJob.ctc.min)} - {formatCurrency(selectedJob.ctc.max)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Applications:</strong> {selectedJob.applicationCount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Deadline:</strong> {format(new Date(selectedJob.applicationDeadline), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Posted:</strong> {format(new Date(selectedJob.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Edit color="primary" />
            <Typography variant="h6">
              Edit Job - {selectedJob?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {editError}
            </Alert>
          )}
          
          {editSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {editSuccess}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={editData.title}
                onChange={(e) => handleEditInputChange('title', e.target.value)}
                required
                placeholder="e.g., Software Developer"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                value={editData.designation}
                onChange={(e) => handleEditInputChange('designation', e.target.value)}
                required
                placeholder="e.g., Junior Developer"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={selectedJob?.companyName || ''}
                disabled
                helperText="Company name cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={editData.location}
                onChange={(e) => handleEditInputChange('location', e.target.value)}
                required
                placeholder="e.g., Bangalore, Karnataka"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                value={editData.description}
                onChange={(e) => handleEditInputChange('description', e.target.value)}
                required
                multiline
                rows={4}
                placeholder="Describe the job role, responsibilities, and requirements..."
              />
            </Grid>

            {/* Job Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Job Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={editData.jobType}
                  onChange={(e) => handleEditInputChange('jobType', e.target.value)}
                  label="Job Type"
                >
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Job Category</InputLabel>
                <Select
                  value={editData.jobCategory}
                  onChange={(e) => handleEditInputChange('jobCategory', e.target.value)}
                  label="Job Category"
                >
                  {jobCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Work Mode</InputLabel>
                <Select
                  value={editData.workMode}
                  onChange={(e) => handleEditInputChange('workMode', e.target.value)}
                  label="Work Mode"
                >
                  {workModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Experience Required</InputLabel>
                <Select
                  value={editData.experienceRequired}
                  onChange={(e) => handleEditInputChange('experienceRequired', e.target.value)}
                  label="Experience Required"
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Deadline"
                type="date"
                value={editData.applicationDeadline}
                onChange={(e) => handleEditInputChange('applicationDeadline', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Compensation */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Compensation
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum CTC (₹)"
                type="number"
                value={editData.ctc.min}
                onChange={(e) => handleEditInputChange('ctc.min', e.target.value)}
                required
                placeholder="e.g., 500000"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum CTC (₹)"
                type="number"
                value={editData.ctc.max}
                onChange={(e) => handleEditInputChange('ctc.max', e.target.value)}
                required
                placeholder="e.g., 800000"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={editData.ctc.currency}
                  onChange={(e) => handleEditInputChange('ctc.currency', e.target.value)}
                  label="Currency"
                >
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Skills and Eligibility */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Skills & Eligibility
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Skills Required"
                value={editData.skillsRequired.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js"
                helperText="Separate multiple skills with commas"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Allowed Courses"
                value={editData.eligibility.allowedCourses.join(', ')}
                onChange={(e) => handleCoursesChange(e.target.value)}
                placeholder="e.g., Computer Science, Information Technology"
                helperText="Separate multiple courses with commas"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum CGPA"
                type="number"
                value={editData.eligibility.minCGPA}
                onChange={(e) => handleEditInputChange('eligibility.minCGPA', e.target.value)}
                placeholder="e.g., 7.0"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Backlogs"
                type="number"
                value={editData.eligibility.maxBacklogs}
                onChange={(e) => handleEditInputChange('eligibility.maxBacklogs', parseInt(e.target.value) || 0)}
                placeholder="e.g., 2"
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : <Edit />}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageJobs;
