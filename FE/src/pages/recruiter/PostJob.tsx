import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Save,
  Preview,
  ArrowBack,
  Work,
  KeyboardArrowDown,
  Check,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../../services/jobService';

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coursesAnchorEl, setCoursesAnchorEl] = useState<null | HTMLElement>(null);
  const [tempAllowedCourses, setTempAllowedCourses] = useState<string[]>([]);

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    companyName: user?.recruiterDetails?.companyName || '',
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
    interviewProcess: {
      rounds: [] as Array<{
        type: string;
        description: string;
        duration: string;
      }>,
      totalRounds: 1,
    },
  });

  const jobTypes = ['Full-time', 'Internship', 'Part-time'];
  const jobCategories = ['Technical', 'Non-Technical', 'Research', 'Management'];
  const workModes = ['Work from Office', 'Work from Home', 'Hybrid'];
  const experienceLevels = ['Fresher', '0-1 years', '1-2 years', '2+ years'];

  // Predefined eligible courses
  const ELIGIBLE_COURSES = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Aerospace Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cybersecurity',
    'Software Engineering',
    'Computer Applications',
    'Business Administration',
    'Management Studies',
    'Finance',
    'Marketing',
    'Human Resources',
    'Digital Marketing',
    'Graphic Design',
    'Animation',
    'Other'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setJobData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setJobData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setJobData(prev => ({
      ...prev,
      skillsRequired: skills,
    }));
  };

  const handleCoursesChange = (value: string) => {
    const courses = value.split(',').map(course => course.trim()).filter(course => course);
    setJobData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        allowedCourses: courses,
      },
    }));
  };

  const handleCoursesClick = (event: React.MouseEvent<HTMLElement>) => {
    setCoursesAnchorEl(event.currentTarget);
    setTempAllowedCourses(jobData.eligibility.allowedCourses);
  };

  const handleCoursesClose = () => {
    setCoursesAnchorEl(null);
    setTempAllowedCourses([]);
  };

  const handleCoursesToggle = (course: string) => {
    setTempAllowedCourses(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const handleCoursesSelect = () => {
    setJobData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        allowedCourses: tempAllowedCourses,
      },
    }));
    setCoursesAnchorEl(null);
    setTempAllowedCourses([]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.location || !jobData.designation) {
        setError('Please fill in all required fields');
        return;
      }

      if (!jobData.applicationDeadline) {
        setError('Please select an application deadline');
        return;
      }

      if (new Date(jobData.applicationDeadline) <= new Date()) {
        setError('Application deadline must be in the future');
        return;
      }

      if (!jobData.ctc.min || !jobData.ctc.max) {
        setError('Please specify CTC range');
        return;
      }

      if (parseFloat(jobData.ctc.min) >= parseFloat(jobData.ctc.max)) {
        setError('Minimum CTC must be less than maximum CTC');
        return;
      }

      const response = await jobService.createJob(jobData);
      setSuccess(`Job posted successfully! Job ID: ${response._id}`);
      
      // Redirect to manage jobs after 2 seconds
      setTimeout(() => {
        window.location.href = '/recruiter/jobs';
      }, 2000);
      
      // Reset form
      setJobData({
        title: '',
        description: '',
        companyName: user?.recruiterDetails?.companyName || '',
        location: '',
        jobType: 'Full-time',
        designation: '',
        skillsRequired: [],
        eligibility: {
          minCGPA: '',
          allowedCourses: [],
          maxBacklogs: 0,
          yearOfCompletion: [],
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
        interviewProcess: {
          rounds: [],
          totalRounds: 1,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Work sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Post New Job
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => window.location.href = '/recruiter/dashboard'}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Job Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Job Title"
              value={jobData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="e.g., Software Developer"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Designation"
              value={jobData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              required
              placeholder="e.g., Junior Developer"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={jobData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              required
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={jobData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
              placeholder="e.g., Bangalore, Karnataka"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={jobData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Job Category</InputLabel>
              <Select
                value={jobData.jobCategory}
                onChange={(e) => handleInputChange('jobCategory', e.target.value)}
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Work Mode</InputLabel>
              <Select
                value={jobData.workMode}
                onChange={(e) => handleInputChange('workMode', e.target.value)}
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
                value={jobData.experienceRequired}
                onChange={(e) => handleInputChange('experienceRequired', e.target.value)}
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Description"
              value={jobData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={6}
              required
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Compensation & Benefits
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Minimum CTC (LPA)"
              value={jobData.ctc.min}
              onChange={(e) => handleInputChange('ctc.min', e.target.value)}
              type="number"
              required
              placeholder="e.g., 5"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Maximum CTC (LPA)"
              value={jobData.ctc.max}
              onChange={(e) => handleInputChange('ctc.max', e.target.value)}
              type="number"
              required
              placeholder="e.g., 8"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={jobData.ctc.currency}
                onChange={(e) => handleInputChange('ctc.currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Eligibility Criteria
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum CGPA"
              value={jobData.eligibility.minCGPA}
              onChange={(e) => handleInputChange('eligibility.minCGPA', e.target.value)}
              type="number"
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              placeholder="e.g., 7.0"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maximum Backlogs"
              value={jobData.eligibility.maxBacklogs}
              onChange={(e) => handleInputChange('eligibility.maxBacklogs', parseInt(e.target.value))}
              type="number"
              inputProps={{ min: 0 }}
              placeholder="e.g., 0"
            />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
                Eligible Courses
              </Typography>
              <TextField
                fullWidth
                value=""
                placeholder="Click to select eligible courses"
                onClick={handleCoursesClick}
                InputProps={{
                  readOnly: true,
                  endAdornment: <KeyboardArrowDown />,
                  sx: {
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  },
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {jobData.eligibility.allowedCourses.map((course) => (
                  <Chip 
                    key={course} 
                    label={course} 
                    size="small" 
                    color="primary"
                    onDelete={() => {
                      const newCourses = jobData.eligibility.allowedCourses.filter(c => c !== course);
                      setJobData(prev => ({
                        ...prev,
                        eligibility: {
                          ...prev.eligibility,
                          allowedCourses: newCourses,
                        },
                      }));
                    }}
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select one or more courses that are eligible for this job position.
              </Typography>
            </Box>

            {/* Custom Popover for Eligible Courses Selection */}
            <Popover
              open={Boolean(coursesAnchorEl)}
              anchorEl={coursesAnchorEl}
              onClose={handleCoursesClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  width: coursesAnchorEl ? coursesAnchorEl.offsetWidth : 'auto',
                  maxHeight: 300,
                  mt: 1,
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Eligible Courses
                </Typography>
                <List dense>
                  {ELIGIBLE_COURSES.map((course) => (
                    <ListItem key={course} disablePadding>
                      <ListItemButton
                        onClick={() => handleCoursesToggle(course)}
                        sx={{
                          backgroundColor: tempAllowedCourses.includes(course) ? 'primary.main' : 'transparent',
                          color: tempAllowedCourses.includes(course) ? 'white' : 'text.primary',
                          '&:hover': {
                            backgroundColor: tempAllowedCourses.includes(course) ? 'primary.dark' : 'action.hover',
                          },
                          borderRadius: 1,
                          mb: 0.5,
                        }}
                      >
                        <Checkbox
                          checked={tempAllowedCourses.includes(course)}
                          sx={{
                            color: tempAllowedCourses.includes(course) ? 'white' : 'text.primary',
                            '&.Mui-checked': { color: 'white' },
                          }}
                        />
                        <ListItemText 
                          primary={course}
                          sx={{ fontWeight: tempAllowedCourses.includes(course) ? 'bold' : 'normal' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button variant="outlined" onClick={handleCoursesClose} size="small">
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleCoursesSelect} size="small" startIcon={<Check />}>
                    Select
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Skills & Requirements
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Required Skills (comma-separated)"
              value={jobData.skillsRequired.join(', ')}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js, MongoDB"
              helperText="Enter skills separated by commas"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Application Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Application Deadline"
              value={jobData.applicationDeadline}
              onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
              type="datetime-local"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={() => {
              // Preview functionality
              console.log('Job Preview:', jobData);
            }}
          >
            Preview Job
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Post Job'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PostJob;
