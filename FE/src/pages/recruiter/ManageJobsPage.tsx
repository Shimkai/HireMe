import { Container, Grid, Card, CardContent, Typography, Button, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit, Delete, Visibility, Work, LocationOn, Business, CheckCircle, Cancel } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { Job } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const ManageJobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showError, setShowError] = useState(false);

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    ctc: { min: 0, max: 0, currency: 'LPA' },
    jobType: '',
    experienceRequired: '',
    description: '',
    designation: '',
    skillsRequired: [] as string[],
    applicationDeadline: '',
    jobCategory: '',
    workMode: 'Work from Office',
    eligibility: {
      minCGPA: 0,
      allowedCourses: [] as string[],
      maxBacklogs: 0,
      yearOfCompletion: [] as number[]
    }
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs();
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: Job) => {
    if (job.status === 'Approved') {
      setActionError('Cannot edit approved jobs. Please contact TnP for any changes.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    
    setSelectedJob(job);
    setEditFormData({
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      ctc: job.ctc || { min: 0, max: 0, currency: 'LPA' },
      jobType: job.jobType,
      experienceRequired: job.experienceRequired,
      description: job.description,
      designation: job.designation,
      skillsRequired: job.skillsRequired || [],
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      jobCategory: job.jobCategory || '',
      workMode: job.workMode || 'Work from Office',
      eligibility: job.eligibility || {
        minCGPA: 0,
        allowedCourses: [],
        maxBacklogs: 0,
        yearOfCompletion: []
      }
    });
    setActionError('');
    setEditDialog(true);
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    setActionError('');
    setDeleteDialog(true);
  };

  const confirmEdit = async () => {
    if (!selectedJob) return;

    try {
      setProcessing(true);
      setActionError('');
      
      await jobService.updateJob(selectedJob._id, editFormData);
      
      setEditDialog(false);
      setSelectedJob(null);
      
      // Refresh the jobs list
      fetchMyJobs();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to update job');
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedJob) return;

    try {
      setProcessing(true);
      setActionError('');
      
      await jobService.deleteJob(selectedJob._id);
      
      setDeleteDialog(false);
      setSelectedJob(null);
      
      // Refresh the jobs list
      fetchMyJobs();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to delete job');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseDialogs = () => {
    setEditDialog(false);
    setDeleteDialog(false);
    setSelectedJob(null);
    setActionError('');
  };

  const addSkill = () => {
    if (newSkill.trim() && !editFormData.skillsRequired.includes(newSkill.trim())) {
      setEditFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
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

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            My Jobs
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/jobs/new'}
            startIcon={<Work />}
          >
            Post New Job
          </Button>
        </Box>

        {showError && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setShowError(false)}>
            {actionError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary.main">
                      {jobs.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Jobs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {jobs.filter(job => job.status === 'Approved').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Approved Jobs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {jobs.filter(job => job.status === 'Pending').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Jobs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main">
                      {jobs.reduce((sum, job) => sum + job.applicationCount, 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Applications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {jobs.length === 0 ? (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        No jobs posted yet
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Start by posting your first job to attract talented candidates.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => window.location.href = '/jobs/new'}
                        startIcon={<Work />}
                      >
                        Post Your First Job
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                jobs.map((job) => (
                  <Grid item xs={12} md={6} key={job._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {job.title}
                          </Typography>
                          <Chip
                            label={job.status}
                            color={getStatusColor(job.status) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Business sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {job.companyName}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {job.location}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Work sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {job.jobType} • {job.experienceRequired}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {job.description.length > 100 
                            ? `${job.description.substring(0, 100)}...` 
                            : job.description
                          }
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="textSecondary">
                            {job.applicationCount} applications
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEdit(job)}
                              disabled={job.status === 'Approved'}
                              title={job.status === 'Approved' ? 'Cannot edit approved jobs' : 'Edit job'}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(job)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </>
        )}

        {/* Edit Job Dialog */}
        <Dialog open={editDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogContent>
            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionError}
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={editFormData.companyName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, designation: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum CTC (LPA)"
                  type="number"
                  value={editFormData.ctc.min}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    ctc: { ...prev.ctc, min: parseFloat(e.target.value) || 0 }
                  }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum CTC (LPA)"
                  type="number"
                  value={editFormData.ctc.max}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    ctc: { ...prev.ctc, max: parseFloat(e.target.value) || 0 }
                  }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={editFormData.jobType}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, jobType: e.target.value }))}
                    label="Job Type"
                  >
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Experience Required</InputLabel>
                  <Select
                    value={editFormData.experienceRequired}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, experienceRequired: e.target.value }))}
                    label="Experience Required"
                  >
                    <MenuItem value="Fresher">Fresher</MenuItem>
                    <MenuItem value="0-1 years">0-1 years</MenuItem>
                    <MenuItem value="1-2 years">1-2 years</MenuItem>
                    <MenuItem value="2+ years">2+ years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Job Category</InputLabel>
                  <Select
                    value={editFormData.jobCategory}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, jobCategory: e.target.value }))}
                    label="Job Category"
                  >
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Non-Technical">Non-Technical</MenuItem>
                    <MenuItem value="Research">Research</MenuItem>
                    <MenuItem value="Management">Management</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    value={editFormData.workMode}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, workMode: e.target.value }))}
                    label="Work Mode"
                  >
                    <MenuItem value="Work from Office">Work from Office</MenuItem>
                    <MenuItem value="Work from Home">Work from Home</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  type="date"
                  value={editFormData.applicationDeadline}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    size="small"
                  />
                  <Button variant="outlined" onClick={addSkill}>
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {editFormData.skillsRequired.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => removeSkill(skill)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmEdit} 
              variant="contained"
              disabled={processing}
            >
              {processing ? <CircularProgress size={20} /> : 'Update Job'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Job Dialog */}
        <Dialog open={deleteDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Job</DialogTitle>
          <DialogContent>
            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionError}
              </Alert>
            )}
            
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete the job posting for "{selectedJob?.title}" at {selectedJob?.companyName}?
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              This action cannot be undone. All applications for this job will also be removed.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs} disabled={processing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              variant="contained" 
              color="error"
              disabled={processing}
            >
              {processing ? <CircularProgress size={20} /> : 'Delete Job'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default ManageJobsPage;
