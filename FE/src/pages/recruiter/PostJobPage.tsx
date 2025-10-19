import { Container, Grid, Card, CardContent, Typography, Button, Box, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Alert } from '@mui/material';
import { Add, Save, Cancel, Work, LocationOn, Business } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState } from 'react';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../hooks/useAuth';

const PostJobPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    ctc: { min: 0, max: 0, currency: 'INR' },
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
      yearOfCompletion: [] as number[],
      minTenthPercentage: 0,
      minTwelfthPercentage: 0
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skillsRequired.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const jobData = {
        ...formData,
        postedBy: user?.email || '',
        status: 'Pending', // Jobs start as pending until TnP approval
        isActive: true,
        applicationCount: 0
      };

      await jobService.createJob(jobData);
      
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        title: '',
        companyName: '',
        location: '',
        ctc: { min: 0, max: 0, currency: 'INR' },
        jobType: '',
        experienceRequired: '',
        description: '',
        designation: '',
        skillsRequired: [],
        applicationDeadline: '',
        jobCategory: '',
        workMode: 'Work from Office',
        eligibility: {
          minCGPA: 0,
          allowedCourses: [],
          maxBacklogs: 0,
          yearOfCompletion: []
        }
      });
    } catch (err: any) {
      setSubmitError(err.response?.data?.error?.message || 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Post New Job
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create a job posting to attract talented candidates
          </Typography>
        </Box>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSubmitSuccess(false)}>
            Job posted successfully! It will be reviewed by TnP before going live.
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
            {submitError}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Software Engineer"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Tech Corp"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum CTC (LPA)"
                    type="number"
                    value={formData.ctc.min}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ctc: { ...prev.ctc, min: parseFloat(e.target.value) || 0 }
                    }))}
                    required
                    placeholder="e.g., 8"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum CTC (LPA)"
                    type="number"
                    value={formData.ctc.max}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ctc: { ...prev.ctc, max: parseFloat(e.target.value) || 0 }
                    }))}
                    required
                    placeholder="e.g., 12"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
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
                      name="experienceRequired"
                      value={formData.experienceRequired}
                      onChange={handleChange}
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
                      name="jobCategory"
                      value={formData.jobCategory}
                      onChange={handleChange}
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
                  <TextField
                    fullWidth
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Software Engineer"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Work Mode</InputLabel>
                    <Select
                      name="workMode"
                      value={formData.workMode}
                      onChange={handleChange}
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
                    name="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                    placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Eligibility Criteria
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum CGPA"
                    type="number"
                    value={formData.eligibility.minCGPA}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, minCGPA: parseFloat(e.target.value) || 0 }
                    }))}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    placeholder="e.g., 7.0"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum 10th Percentage"
                    type="number"
                    value={formData.eligibility.minTenthPercentage}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, minTenthPercentage: parseFloat(e.target.value) || 0 }
                    }))}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    placeholder="e.g., 60"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum 12th Percentage"
                    type="number"
                    value={formData.eligibility.minTwelfthPercentage}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, minTwelfthPercentage: parseFloat(e.target.value) || 0 }
                    }))}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    placeholder="e.g., 60"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Backlogs Allowed"
                    type="number"
                    value={formData.eligibility.maxBacklogs}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, maxBacklogs: parseInt(e.target.value) || 0 }
                    }))}
                    inputProps={{ min: 0 }}
                    placeholder="e.g., 0"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                    <Button variant="outlined" onClick={addSkill} startIcon={<Add />}>
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.skillsRequired.map((skill, index) => (
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

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => window.location.reload()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Job'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Job Posting Guidelines
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Work sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Clear Job Title
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Use specific, descriptive job titles that clearly indicate the role.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Location Details
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Include city, state, and whether remote work is available.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Business sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Company Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Provide accurate company name and brief description.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Work sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Detailed Description
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Include responsibilities, requirements, and benefits.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default PostJobPage;
