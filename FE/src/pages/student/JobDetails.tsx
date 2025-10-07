import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  Business,
  Schedule,
  AttachMoney,
  School,
  Work,
  ArrowBack,
  Upload,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { format } from 'date-fns';

interface JobDetails {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: string;
  designation: string;
  skillsRequired: string[];
  eligibility: {
    minCGPA?: number;
    allowedCourses: string[];
    maxBacklogs?: number;
    yearOfCompletion?: number[];
  };
  ctc: {
    min: number;
    max: number;
    currency: string;
  };
  experienceRequired: string;
  applicationDeadline: string;
  postedBy: {
    _id: string;
    fullName: string;
    recruiterDetails: {
      companyName: string;
      industry: string;
      designation: string;
    };
  };
  status: string;
  applicationCount: number;
  interviewProcess?: {
    rounds: Array<{
      type: string;
      description: string;
      duration: string;
    }>;
    totalRounds: number;
  };
  workMode?: string;
  jobCategory?: string;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobData = await jobService.getJobById(id!);
      setJob(jobData as JobDetails);
      
      // Check if student has already applied to this job
      if (user?.role === 'Student') {
        try {
          const applicationsResponse = await applicationService.getMyApplications({ limit: 100 });
          const hasAppliedToThisJob = applicationsResponse.data.some(
            (app: any) => app.jobId._id === id
          );
          setHasApplied(hasAppliedToThisJob);
        } catch (err) {
          // If we can't fetch applications, assume not applied
          setHasApplied(false);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!resumeFile || !job) return;

    try {
      setApplying(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);

      await applicationService.applyToJob(job._id, formData);
      
      // Close dialog and reset form
      setApplyDialogOpen(false);
      setResumeFile(null);
      
      // Mark as applied
      setHasApplied(true);
      
      // Refresh job details to update application status
      fetchJobDetails();
    } catch (err: any) {
      // Handle specific error cases
      if (err.response?.status === 409) {
        // Already applied - just close the dialog and refresh
        setApplyDialogOpen(false);
        setResumeFile(null);
        setHasApplied(true);
        fetchJobDetails();
      } else {
        // Other errors - show alert
        alert(err.response?.data?.error?.message || 'Failed to submit application');
      }
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isDeadlinePassed = job ? new Date(job.applicationDeadline) < new Date() : false;
  
  // Check CGPA eligibility
  const isCgpaEligible = !job?.eligibility.minCGPA || 
                        !user?.studentDetails?.cgpa || 
                        user.studentDetails.cgpa >= job.eligibility.minCGPA;
  
  const canApply = user?.role === 'Student' && 
                   user?.studentDetails?.isVerified && 
                   job?.status === 'Approved' && 
                   !isDeadlinePassed &&
                   !hasApplied &&
                   isCgpaEligible;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Job not found'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student/jobs')}
          sx={{ mt: 2 }}
        >
          Back to Jobs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/student/jobs')}
        sx={{ mb: 3 }}
      >
        Back to Jobs
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 64,
                  height: 64,
                }}
              >
                {job.companyName.charAt(0)}
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {job.title}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {job.companyName}
                </Typography>
              </Box>
              <Chip
                label={job.status}
                color={job.status === 'Approved' ? 'success' : 'warning'}
                size="medium"
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Job Details */}
            <Stack spacing={2} mb={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn color="action" />
                <Typography variant="body1">{job.location}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Business color="action" />
                <Typography variant="body1">{job.jobType}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoney color="action" />
                <Typography variant="body1">
                  {formatCurrency(job.ctc.min)} - {formatCurrency(job.ctc.max)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule color="action" />
                <Typography
                  variant="body1"
                  color={isDeadlinePassed ? 'error.main' : 'text.primary'}
                >
                  Application Deadline: {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Work color="action" />
                <Typography variant="body1">{job.experienceRequired}</Typography>
              </Box>
            </Stack>

            {/* Job Description */}
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </Typography>

            {/* Skills Required */}
            {job.skillsRequired.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Skills Required
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {job.skillsRequired.map((skill, index) => (
                    <Chip key={index} label={skill} variant="outlined" />
                  ))}
                </Box>
              </>
            )}

            {/* Eligibility Criteria */}
            <Typography variant="h6" gutterBottom>
              Eligibility Criteria
            </Typography>
            <Stack spacing={1} mb={3}>
              {job.eligibility.minCGPA && (
                <Box display="flex" alignItems="center" gap={1}>
                  <School color="action" />
                  <Typography variant="body1">
                    Minimum CGPA: {job.eligibility.minCGPA}
                  </Typography>
                </Box>
              )}
              {job.eligibility.allowedCourses.length > 0 && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Eligible Courses:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {job.eligibility.allowedCourses.map((course, index) => (
                      <Chip key={index} label={course} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              {job.eligibility.maxBacklogs !== undefined && (
                <Typography variant="body1">
                  Maximum Backlogs: {job.eligibility.maxBacklogs}
                </Typography>
              )}
            </Stack>

            {/* Interview Process */}
            {job.interviewProcess && (
              <>
                <Typography variant="h6" gutterBottom>
                  Interview Process
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Total Rounds: {job.interviewProcess.totalRounds}
                </Typography>
                {job.interviewProcess.rounds.map((round, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Round {index + 1}: {round.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {round.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Duration: {round.duration}
                    </Typography>
                  </Paper>
                ))}
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            
            {job.applicationCount > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {job.applicationCount} applications received
              </Typography>
            )}

            {hasApplied ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled
                sx={{ mb: 2 }}
              >
                Already Applied
              </Button>
            ) : canApply ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setApplyDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Apply Now
              </Button>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                {!user?.studentDetails?.isVerified
                  ? 'Please get verified by your TnP officer to apply for jobs'
                  : job.status !== 'Approved'
                  ? 'This job is not yet approved'
                  : isDeadlinePassed
                  ? 'Application deadline has passed'
                  : !isCgpaEligible
                  ? `Your CGPA (${user?.studentDetails?.cgpa || 'Not specified'}) is below the minimum requirement (${job.eligibility.minCGPA})`
                  : 'You cannot apply for this job'}
              </Alert>
            )}

            {/* Company Information */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Company:</strong> {job.companyName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Industry:</strong> {job.postedBy.recruiterDetails.industry}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Posted by:</strong> {job.postedBy.fullName}
            </Typography>
            <Typography variant="body2">
              <strong>Designation:</strong> {job.postedBy.recruiterDetails.designation}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please upload your resume to apply for this position.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
            fullWidth
            sx={{ mb: 2 }}
          >
            {resumeFile ? resumeFile.name : 'Choose Resume File'}
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            Only PDF files are accepted. Maximum file size: 5MB
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={!resumeFile || applying}
          >
            {applying ? 'Applying...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobDetails;
