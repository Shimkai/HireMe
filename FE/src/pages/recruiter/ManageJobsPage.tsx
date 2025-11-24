import { Container, Grid, Card, CardContent, Typography, Button, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider, Collapse } from '@mui/material';
import { Edit, Delete, Visibility, Work, LocationOn, Business, ExpandMore, ExpandLess, Assignment, PersonSearch } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { Job, Application, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import StudentDetailsModal from '../../components/common/StudentDetailsModal';
import SkillsMultiSelect from '../../components/common/SkillsMultiSelect';
import TestLinkDialog from '../../components/recruiter/TestLinkDialog';
import RecommendedStudents from '../../components/recruiter/RecommendedStudents';

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
  
  // Test link dialog
  const [testLinkDialogOpen, setTestLinkDialogOpen] = useState(false);
  const [selectedJobForTestLink, setSelectedJobForTestLink] = useState<Job | null>(null);
  
  // Recommendation dialog
  const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState(false);
  const [selectedJobForRecommendations, setSelectedJobForRecommendations] = useState<string>('');
  
  // Applications and student details modal
  const [applications, setApplications] = useState<{ [jobId: string]: Application[] }>({});
  const [expandedJobs, setExpandedJobs] = useState<{ [jobId: string]: boolean }>({});
  const [applicationsLoading, setApplicationsLoading] = useState<{ [jobId: string]: boolean }>({});
  const [studentDetailsModalOpen, setStudentDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

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

  const fetchJobApplications = async (jobId: string) => {
    try {
      setApplicationsLoading(prev => ({ ...prev, [jobId]: true }));
      const response = await applicationService.getJobApplications(jobId);
      setApplications(prev => ({ ...prev, [jobId]: response.data }));
    } catch (err: any) {
      console.error('Error fetching applications for job:', jobId, err);
      setApplications(prev => ({ ...prev, [jobId]: [] }));
    } finally {
      setApplicationsLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleToggleApplications = (jobId: string) => {
    const isExpanded = expandedJobs[jobId];
    setExpandedJobs(prev => ({ ...prev, [jobId]: !isExpanded }));
    
    // Fetch applications if not already loaded
    if (!isExpanded && !applications[jobId]) {
      fetchJobApplications(jobId);
    }
  };

  const handleViewStudentDetails = (application: Application) => {
    const student = application.studentId as User;
    setSelectedStudent(student);
    setSelectedApplication(application);
    setStudentDetailsModalOpen(true);
  };

  const handleCloseStudentDetailsModal = () => {
    setStudentDetailsModalOpen(false);
    setSelectedStudent(null);
    setSelectedApplication(null);
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
      eligibility: {
        minCGPA: job.eligibility?.minCGPA || 0,
        allowedCourses: job.eligibility?.allowedCourses || [],
        maxBacklogs: job.eligibility?.maxBacklogs || 0,
        yearOfCompletion: job.eligibility?.yearOfCompletion || []
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

  const handleOpenTestLinkDialog = (job: Job) => {
    setSelectedJobForTestLink(job);
    setTestLinkDialogOpen(true);
  };

  const handleCloseTestLinkDialog = () => {
    setTestLinkDialogOpen(false);
    setSelectedJobForTestLink(null);
  };

  const handleOpenRecommendations = (jobId: string) => {
    setSelectedJobForRecommendations(jobId);
    setRecommendationsDialogOpen(true);
  };

  const handleCloseRecommendations = () => {
    setRecommendationsDialogOpen(false);
    setSelectedJobForRecommendations('');
  };

  const handleSendTestLink = async (testLink: string, target: 'all' | 'shortlisted') => {
    if (!selectedJobForTestLink) return;

    try {
      await applicationService.sendTestLink(selectedJobForTestLink._id, testLink, target);
      // Refresh jobs to update application counts
      await fetchMyJobs();
    } catch (err: any) {
      throw err;
    }
  };

  const handleSkillsChange = (skills: string[]) => {
    setEditFormData(prev => ({
      ...prev,
      skillsRequired: skills
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
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              {job.applicationCount} applications
                            </Typography>
                            {job.applicationCount > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => handleToggleApplications(job._id)}
                                title={expandedJobs[job._id] ? 'Hide applications' : 'Show applications'}
                              >
                                {expandedJobs[job._id] ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            )}
                          </Box>
                          <Box>
                            {job.status === 'Approved' && job.applicationCount > 0 && (
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleOpenTestLinkDialog(job)}
                                title="Send Test Link to Applicants"
                              >
                                <Assignment />
                              </IconButton>
                            )}
                            {job.status === 'Approved' && (
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenRecommendations(job._id)}
                                title="View Recommended Students"
                              >
                                <PersonSearch />
                              </IconButton>
                            )}
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

                        {/* Applications List */}
                        <Collapse in={expandedJobs[job._id]}>
                          <Box sx={{ mt: 2 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" gutterBottom color="primary">
                              Student Applications
                            </Typography>
                            
                            {applicationsLoading[job._id] ? (
                              <Box display="flex" justifyContent="center" p={2}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : applications[job._id] && applications[job._id].length > 0 ? (
                              <List dense>
                                {applications[job._id].map((application) => {
                                  const student = application.studentId as User;
                                  return (
                                    <ListItem
                                      key={application._id}
                                      sx={{
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 1,
                                        backgroundColor: 'grey.50'
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar
                                          src={student.profileAvatar ? `http://localhost:5000${student.profileAvatar}` : undefined}
                                          sx={{ width: 32, height: 32 }}
                                        >
                                          {student.fullName?.charAt(0) || 'U'}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight="medium">
                                              {student.fullName}
                                            </Typography>
                                            <Chip
                                              label={application.status}
                                              color={getStatusColor(application.status) as any}
                                              size="small"
                                            />
                                          </Box>
                                        }
                                        secondary={
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              {student.email}
                                            </Typography>
                                            <br />
                                            <Typography variant="caption" color="text.secondary">
                                              Applied: {new Date(application.appliedAt).toLocaleDateString()}
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleViewStudentDetails(application)}
                                        title="View Student Details"
                                      >
                                        <Visibility />
                                      </IconButton>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                No applications found for this job.
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
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
                <SkillsMultiSelect
                  selectedSkills={editFormData.skillsRequired}
                  onSkillsChange={handleSkillsChange}
                  label="Required Skills"
                  placeholder="Select skills from the dropdown..."
                  helperText="Choose one or more skills from the predefined list"
                />
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

        {/* Student Details Modal */}
        <StudentDetailsModal
          open={studentDetailsModalOpen}
          onClose={handleCloseStudentDetailsModal}
          student={selectedStudent}
          applicationData={selectedApplication ? {
            status: selectedApplication.status,
            appliedAt: selectedApplication.appliedAt,
            jobTitle: selectedJob?.title,
            companyName: selectedJob?.companyName
          } : undefined}
        />

        {/* Test Link Dialog */}
        {selectedJobForTestLink && (
          <TestLinkDialog
            open={testLinkDialogOpen}
            onClose={handleCloseTestLinkDialog}
            jobId={selectedJobForTestLink._id}
            jobTitle={selectedJobForTestLink.title}
            companyName={selectedJobForTestLink.companyName}
            applicationCount={selectedJobForTestLink.applicationCount}
            shortlistedCount={applications[selectedJobForTestLink._id]?.filter(app => app.status === 'Shortlisted').length || 0}
            onSend={handleSendTestLink}
          />
        )}

        {/* Recommended Students Dialog */}
        {selectedJobForRecommendations && (
          <RecommendedStudents
            jobId={selectedJobForRecommendations}
            open={recommendationsDialogOpen}
            onClose={handleCloseRecommendations}
          />
        )}
      </Container>
    </MainLayout>
  );
};

export default ManageJobsPage;
