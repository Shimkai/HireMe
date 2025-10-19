import { Container, Grid, Card, CardContent, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, DialogContentText } from '@mui/material';
import { Search, Work, LocationOn, Business, Send, Visibility, AttachFile, Warning } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import RecommendedJobs from '../../components/RecommendedJobs';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { Job } from '../../types';
import { useNavigate } from 'react-router-dom';

const JobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs({ status: 'Approved' });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setApplyDialogOpen(true);
  };

  const handleApplyClick = (job: Job) => {
    // Check if student is verified
    if (!user?.studentDetails?.isVerified) {
      setVerificationDialogOpen(true);
      return;
    }
    
    // If verified, proceed with normal application flow
    setSelectedJob(job);
    setApplyDialogOpen(true);
    setApplyError('');
    setApplySuccess('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleApplySubmit = async () => {
    if (!selectedJob || !resumeFile) {
      setApplyError('Please select a resume file');
      return;
    }

    try {
      setApplying(true);
      setApplyError('');
      
      await applicationService.applyToJob(selectedJob._id, resumeFile);
      
      setApplySuccess('Application submitted successfully!');
      setApplyDialogOpen(false);
      setResumeFile(null);
      setSelectedJob(null);
      
      // Refresh jobs to update application count
      fetchJobs();
    } catch (err: any) {
      setApplyError(err.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleCloseDialog = () => {
    setApplyDialogOpen(false);
    setResumeFile(null);
    setSelectedJob(null);
    setApplyError('');
    setApplySuccess('');
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Closed': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Available Jobs
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Find your dream job
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
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
                  {jobs.filter(job => job.status === 'Open').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Open Positions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main">
                  {jobs.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Companies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => {
                    return sum + (job.ctc?.min || 0);
                  }, 0) / jobs.length) : 0}L
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Package
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recommended Jobs Section */}
        <RecommendedJobs limit={6} onJobClick={handleJobClick} />

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search jobs by title, company, or location..."
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
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {job.title}
                    </Typography>
                    <Chip 
                      label={job.status} 
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" color="textSecondary">
                      {job.companyName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" color="textSecondary">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Work sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" color="textSecondary">
                      {job.jobType}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ₹{job.ctc?.min}-{job.ctc?.max} {job.ctc?.currency || 'LPA'}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                      Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {job.skillsRequired?.slice(0, 3).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" color="primary" />
                      ))}
                      {job.skillsRequired?.length > 3 && (
                        <Chip
                          label={`+${job.skillsRequired.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Send />}
                    sx={{ mb: 1 }}
                    onClick={() => handleApplyClick(job)}
                    disabled={!job.isActive || new Date(job.applicationDeadline) < new Date()}
                  >
                    Apply Now
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Application Dialog */}
        <Dialog open={applyDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          <DialogContent>
            {applyError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {applyError}
              </Alert>
            )}
            {applySuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {applySuccess}
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Company: {selectedJob?.companyName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Location: {selectedJob?.location}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Salary: ₹{selectedJob?.ctc?.min}-{selectedJob?.ctc?.max} {selectedJob?.ctc?.currency || 'LPA'}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Upload your resume:
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFile />}
                fullWidth
                sx={{ mt: 1 }}
              >
                {resumeFile ? resumeFile.name : 'Choose Resume File'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Supported formats: PDF, DOC, DOCX
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={applying}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplySubmit} 
              variant="contained" 
              disabled={!resumeFile || applying}
            >
              {applying ? <CircularProgress size={20} /> : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Verification Required Dialog */}
        <Dialog
          open={verificationDialogOpen}
          onClose={() => setVerificationDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Account Verification Required
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              You need to get your account verified by your Training & Placement Officer before you can apply for jobs.
            </DialogContentText>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>To get verified:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                1. Complete your profile with all required information<br/>
                2. Contact your TnP office for verification<br/>
                3. Wait for verification approval
              </Typography>
            </Alert>
            <Typography variant="body2" color="textSecondary">
              Once verified, you'll be able to apply for jobs and access all placement features.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVerificationDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setVerificationDialogOpen(false);
                navigate('/profile');
              }}
            >
              Complete Profile
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default JobsPage;
