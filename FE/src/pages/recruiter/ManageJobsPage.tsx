import { Container, Grid, Card, CardContent, Typography, Button, Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, Avatar, List, ListItem, ListItemText, ListItemAvatar, Paper, Stack, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Edit, Delete, Visibility, Work, LocationOn, Business, Assignment, PersonSearch, AttachMoney, Schedule, School, Info, People, Download } from '@mui/icons-material';
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

type ExportFilter = 'all' | 'shortlisted' | 'placed' | 'others';

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
  const [applicationsLoading, setApplicationsLoading] = useState<{ [jobId: string]: boolean }>({});
  const [studentDetailsModalOpen, setStudentDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedJobForExport, setSelectedJobForExport] = useState<Job | null>(null);
  const [exportStatusFilter, setExportStatusFilter] = useState<ExportFilter>('all');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  
  // Job details dialog
  const [jobDetailsDialogOpen, setJobDetailsDialogOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  
  // Applicants popup dialog
  const [applicantsDialogOpen, setApplicantsDialogOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<Job | null>(null);

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

  const handleViewJobDetails = (job: Job) => {
    setSelectedJobForDetails(job);
    setJobDetailsDialogOpen(true);
  };

  const handleCloseJobDetails = () => {
    setJobDetailsDialogOpen(false);
    setSelectedJobForDetails(null);
  };

  const handleViewApplicants = async (job: Job) => {
    setSelectedJobForApplicants(job);
    setApplicantsDialogOpen(true);
    
    // Fetch applications if not already loaded
    if (!applications[job._id]) {
      await fetchJobApplications(job._id);
    }
  };

  const handleCloseApplicantsDialog = () => {
    setApplicantsDialogOpen(false);
    setSelectedJobForApplicants(null);
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

  const handleOpenExportDialog = (job: Job) => {
    setSelectedJobForExport(job);
    setExportStatusFilter('all');
    setExportError('');
    setExportDialogOpen(true);
  };

  const handleCloseExportDialog = () => {
    if (exporting) return;
    setExportDialogOpen(false);
    setSelectedJobForExport(null);
    setExportStatusFilter('all');
    setExportError('');
  };

  const handleExportApplicants = async () => {
    if (!selectedJobForExport) return;
    try {
      setExporting(true);
      setExportError('');

      const response = await jobService.exportJobApplications(selectedJobForExport._id, exportStatusFilter);

      const contentType =
        response.headers?.['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      let filename = `${selectedJobForExport.title.replace(/[^a-z0-9]/gi, '_')}_applications.xlsx`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      handleCloseExportDialog();
    } catch (err: any) {
      setExportError(err.response?.data?.error?.message || 'Failed to export applicants. Please try again.');
    } finally {
      setExporting(false);
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
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="textSecondary">
                            {job.applicationCount} applications
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Download fontSize="small" />}
                              onClick={() => handleOpenExportDialog(job)}
                              disabled={job.applicationCount === 0}
                            >
                              Export Excel
                            </Button>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewJobDetails(job)}
                              title="View Job Details"
                            >
                              <Info />
                            </IconButton>
                            {job.applicationCount > 0 && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewApplicants(job)}
                                title="View Applicants"
                              >
                                <People />
                              </IconButton>
                            )}
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

        {/* Export Applicants Dialog */}
        {selectedJobForExport && (
          <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Export Applicants for {selectedJobForExport.title}</DialogTitle>
            <DialogContent>
              {exportError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {exportError}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose which applicants you want to include in the Excel file.
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Applicant Group</FormLabel>
                <RadioGroup
                  value={exportStatusFilter}
                  onChange={(e) => setExportStatusFilter(e.target.value as ExportFilter)}
                >
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label="All applied students"
                  />
                  <FormControlLabel
                    value="shortlisted"
                    control={<Radio />}
                    label="Shortlisted students"
                  />
                  <FormControlLabel
                    value="placed"
                    control={<Radio />}
                    label="Placed students"
                  />
                  <FormControlLabel
                    value="others"
                    control={<Radio />}
                    label="Not yet shortlisted or placed"
                  />
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseExportDialog} disabled={exporting}>
                Cancel
              </Button>
              <Button
                onClick={handleExportApplicants}
                variant="contained"
                disabled={exporting}
              >
                {exporting ? <CircularProgress size={20} /> : 'Download Excel'}
              </Button>
            </DialogActions>
          </Dialog>
        )}

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

        {/* Job Details Dialog */}
        <Dialog
          open={jobDetailsDialogOpen}
          onClose={handleCloseJobDetails}
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
                {selectedJobForDetails?.title}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedJobForDetails && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Job Information
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Company Name
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedJobForDetails.companyName}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Designation
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedJobForDetails.designation}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {selectedJobForDetails.location}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2">
                            {selectedJobForDetails.jobType}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoney fontSize="small" color="action" />
                          <Typography variant="body2">
                            ₹{selectedJobForDetails.ctc.min}L - ₹{selectedJobForDetails.ctc.max}L {selectedJobForDetails.ctc.currency}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Work fontSize="small" color="action" />
                          <Typography variant="body2">
                            {selectedJobForDetails.experienceRequired}
                          </Typography>
                        </Box>
                        {selectedJobForDetails.workMode && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Work Mode
                            </Typography>
                            <Typography variant="body2">
                              {selectedJobForDetails.workMode}
                            </Typography>
                          </Box>
                        )}
                        {selectedJobForDetails.jobCategory && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Job Category
                            </Typography>
                            <Typography variant="body2">
                              {selectedJobForDetails.jobCategory}
                            </Typography>
                          </Box>
                        )}
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">
                            Deadline: {new Date(selectedJobForDetails.applicationDeadline).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Box mt={0.5}>
                            <Chip
                              label={selectedJobForDetails.status}
                              color={getStatusColor(selectedJobForDetails.status) as any}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Applications Received
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedJobForDetails.applicationCount}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Eligibility Criteria
                      </Typography>
                      <Stack spacing={1.5}>
                        {selectedJobForDetails.eligibility.minCGPA && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Minimum CGPA
                            </Typography>
                            <Typography variant="body2">
                              {selectedJobForDetails.eligibility.minCGPA}
                            </Typography>
                          </Box>
                        )}
                        {selectedJobForDetails.eligibility.allowedCourses && selectedJobForDetails.eligibility.allowedCourses.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Allowed Courses
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {selectedJobForDetails.eligibility.allowedCourses.map((course, index) => (
                                <Chip key={index} label={course} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        {selectedJobForDetails.eligibility.maxBacklogs !== undefined && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Maximum Backlogs
                            </Typography>
                            <Typography variant="body2">
                              {selectedJobForDetails.eligibility.maxBacklogs}
                            </Typography>
                          </Box>
                        )}
                        {selectedJobForDetails.eligibility.yearOfCompletion && selectedJobForDetails.eligibility.yearOfCompletion.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Year of Completion
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {selectedJobForDetails.eligibility.yearOfCompletion.map((year, index) => (
                                <Chip key={index} label={year} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Job Description
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedJobForDetails.description}
                      </Typography>
                    </Paper>
                  </Grid>
                  {selectedJobForDetails.skillsRequired && selectedJobForDetails.skillsRequired.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          Required Skills
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          {selectedJobForDetails.skillsRequired.map((skill, index) => (
                            <Chip key={index} label={skill} color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseJobDetails}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Applicants Popup Dialog */}
        <Dialog
          open={applicantsDialogOpen}
          onClose={handleCloseApplicantsDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { maxHeight: '90vh' }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <PersonSearch color="primary" />
                <Typography variant="h6">
                  Applicants for {selectedJobForApplicants?.title}
                </Typography>
              </Box>
              <Chip
                label={`${selectedJobForApplicants?.applicationCount || 0} applications`}
                color="primary"
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedJobForApplicants && (
              <Box>
                {applicationsLoading[selectedJobForApplicants._id] ? (
                  <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : applications[selectedJobForApplicants._id] && applications[selectedJobForApplicants._id].length > 0 ? (
                  <List>
                    {applications[selectedJobForApplicants._id].map((application) => {
                      const student = application.studentId as User;
                      return (
                        <ListItem
                          key={application._id}
                          sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 2,
                            backgroundColor: 'grey.50',
                            '&:hover': {
                              backgroundColor: 'grey.100',
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={student.profileAvatar ? `http://localhost:5000${student.profileAvatar}` : undefined}
                              sx={{ width: 48, height: 48 }}
                            >
                              {student.fullName?.charAt(0) || 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                <Typography variant="subtitle1" fontWeight="medium">
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
                              <Box mt={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                  {student.email}
                                </Typography>
                                {student.mobileNumber && (
                                  <Typography variant="body2" color="text.secondary">
                                    {student.mobileNumber}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  Applied: {new Date(application.appliedAt).toLocaleDateString()} at {new Date(application.appliedAt).toLocaleTimeString()}
                                </Typography>
                                {student.studentDetails && (
                                  <Box mt={1}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <School fontSize="small" />
                                      {student.studentDetails.courseName}
                                      {typeof student.studentDetails.college === 'object' && student.studentDetails.college.name && (
                                        <> • {student.studentDetails.college.name}</>
                                      )}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                          <IconButton
                            color="primary"
                            onClick={() => {
                              handleViewStudentDetails(application);
                              handleCloseApplicantsDialog();
                            }}
                            title="View Student Details"
                            sx={{ ml: 1 }}
                          >
                            <Visibility />
                          </IconButton>
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Box textAlign="center" p={4}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No applications found for this job.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Applications will appear here once students apply.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseApplicantsDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default ManageJobsPage;
