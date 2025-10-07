import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import {
  Save,
  Preview,
  Download,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { resumeService, Resume } from '../../services/resumeService';
import ResumeFormField from '../../components/forms/ResumeFormField';

const steps = [
  'Personal Details',
  'Education',
  'Skills',
  'Projects',
  'Experience',
  'Achievements',
  'Certifications',
];

const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resumeService.getResume();
      setResume(response.data);
    } catch (err: any) {
      // If no resume exists, create a new one
      if (err.response?.status === 404) {
        const newResume: Resume = {
          studentId: user?._id || '',
          personalDetails: {
            name: user?.fullName || '',
            email: user?.email || '',
            phone: user?.mobileNumber || '',
            address: {
              country: 'India',
            },
          },
          education: [],
          skills: {
            technical: [],
            soft: [],
            languages: [],
          },
          projects: [],
          experience: [],
          achievements: [],
          certifications: [],
          isComplete: false,
          lastUpdated: new Date().toISOString(),
          templateUsed: 'modern',
          visibility: {
            public: false,
            recruitersOnly: true,
          },
        };
        setResume(newResume);
      } else {
        setError(err.response?.data?.error?.message || 'Failed to fetch resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    if (!resume) return;

    try {
      setSaving(true);
      setError(null);
      
      if (resume._id) {
        await resumeService.updateResume(resume);
      } else {
        const response = await resumeService.createResume(resume);
        setResume(response.data);
      }
      
      alert('Resume saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    try {
      const pdfBlob = await resumeService.generateResumePDF('modern');
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user?.fullName || 'resume'}-resume.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to generate PDF');
    }
  };

  const updateResumeField = (section: string, field: string, value: any) => {
    if (!resume) return;
    
    setResume(prev => ({
      ...prev!,
      [section]: {
        ...(prev![section as keyof Resume] as any),
        [field]: value,
      },
    }));
  };

  const addArrayItem = (section: string, field: string, newItem: any) => {
    if (!resume) return;
    
    const currentArray = (resume[section as keyof Resume] as any)[field] as any[];
    setResume(prev => ({
      ...prev!,
      [section]: {
        ...(prev![section as keyof Resume] as any),
        [field]: [...currentArray, newItem],
      },
    }));
  };


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step: number) => {
    if (!resume) return null;

    switch (step) {
      case 0: // Personal Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="Full Name"
                value={resume.personalDetails.name}
                onChange={(value) => updateResumeField('personalDetails', 'name', value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="Email"
                value={resume.personalDetails.email}
                onChange={(value) => updateResumeField('personalDetails', 'email', value)}
                type="email"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="Phone Number"
                value={resume.personalDetails.phone}
                onChange={(value) => updateResumeField('personalDetails', 'phone', value)}
                type="tel"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="LinkedIn Profile"
                value={resume.personalDetails.linkedin}
                onChange={(value) => updateResumeField('personalDetails', 'linkedin', value)}
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="GitHub Profile"
                value={resume.personalDetails.github}
                onChange={(value) => updateResumeField('personalDetails', 'github', value)}
                type="url"
                placeholder="https://github.com/yourusername"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="Portfolio Website"
                value={resume.personalDetails.portfolio}
                onChange={(value) => updateResumeField('personalDetails', 'portfolio', value)}
                type="url"
                placeholder="https://yourportfolio.com"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="City"
                value={resume.personalDetails.address.city}
                onChange={(value) => updateResumeField('personalDetails', 'address', {
                  ...resume.personalDetails.address,
                  city: value,
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="State"
                value={resume.personalDetails.address.state}
                onChange={(value) => updateResumeField('personalDetails', 'address', {
                  ...resume.personalDetails.address,
                  state: value,
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="Pincode"
                value={resume.personalDetails.address.pincode}
                onChange={(value) => updateResumeField('personalDetails', 'address', {
                  ...resume.personalDetails.address,
                  pincode: value,
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeFormField
                label="Country"
                value={resume.personalDetails.address.country}
                onChange={(value) => updateResumeField('personalDetails', 'address', {
                  ...resume.personalDetails.address,
                  country: value,
                })}
                required
              />
            </Grid>
          </Grid>
        );

      case 1: // Education
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Education Details
            </Typography>
            {resume.education.map((edu, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ResumeFormField
                      label="Degree"
                      value={edu.degree}
                      onChange={(value) => {
                        const newEducation = [...resume.education];
                        newEducation[index] = { ...edu, degree: value };
                        setResume(prev => ({ ...prev!, education: newEducation }));
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ResumeFormField
                      label="Institution"
                      value={edu.institution}
                      onChange={(value) => {
                        const newEducation = [...resume.education];
                        newEducation[index] = { ...edu, institution: value };
                        setResume(prev => ({ ...prev!, education: newEducation }));
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ResumeFormField
                      label="Field of Study"
                      value={edu.field}
                      onChange={(value) => {
                        const newEducation = [...resume.education];
                        newEducation[index] = { ...edu, field: value };
                        setResume(prev => ({ ...prev!, education: newEducation }));
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ResumeFormField
                      label="Year of Completion"
                      value={edu.yearOfCompletion}
                      onChange={(value) => {
                        const newEducation = [...resume.education];
                        newEducation[index] = { ...edu, yearOfCompletion: parseInt(value) };
                        setResume(prev => ({ ...prev!, education: newEducation }));
                      }}
                      type="number"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ResumeFormField
                      label="CGPA"
                      value={edu.cgpa}
                      onChange={(value) => {
                        const newEducation = [...resume.education];
                        newEducation[index] = { ...edu, cgpa: parseFloat(value) };
                        setResume(prev => ({ ...prev!, education: newEducation }));
                      }}
                      type="number"
                      placeholder="e.g., 8.5"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              variant="outlined"
              onClick={() => addArrayItem('education', 'education', {
                degree: '',
                institution: '',
                field: '',
                yearOfCompletion: new Date().getFullYear(),
                achievements: [],
              })}
            >
              Add Education
            </Button>
          </Box>
        );

      case 2: // Skills
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Technical Skills
              </Typography>
              {resume.skills.technical.map((skill, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResumeFormField
                        label="Skill Name"
                        value={skill.name}
                        onChange={(value) => {
                          const newSkills = [...resume.skills.technical];
                          newSkills[index] = { ...skill, name: value };
                          setResume(prev => ({
                            ...prev!,
                            skills: { ...prev!.skills, technical: newSkills },
                          }));
                        }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResumeFormField
                        label="Proficiency Level"
                        value={skill.proficiency}
                        onChange={(value) => {
                          const newSkills = [...resume.skills.technical];
                          newSkills[index] = { ...skill, proficiency: value };
                          setResume(prev => ({
                            ...prev!,
                            skills: { ...prev!.skills, technical: newSkills },
                          }));
                        }}
                        type="select"
                        options={[
                          { value: 'Beginner', label: 'Beginner' },
                          { value: 'Intermediate', label: 'Intermediate' },
                          { value: 'Advanced', label: 'Advanced' },
                          { value: 'Expert', label: 'Expert' },
                        ]}
                        required
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                variant="outlined"
                onClick={() => addArrayItem('skills', 'technical', {
                  name: '',
                  proficiency: 'Beginner',
                })}
                sx={{ mb: 3 }}
              >
                Add Technical Skill
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Soft Skills
              </Typography>
              <ResumeFormField
                label="Soft Skills"
                value={resume.skills.soft}
                onChange={(value) => updateResumeField('skills', 'soft', value)}
                type="multiselect"
                helperText="Add soft skills like communication, leadership, teamwork, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Languages
              </Typography>
              {resume.skills.languages.map((language, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResumeFormField
                        label="Language"
                        value={language.name}
                        onChange={(value) => {
                          const newLanguages = [...resume.skills.languages];
                          newLanguages[index] = { ...language, name: value };
                          setResume(prev => ({
                            ...prev!,
                            skills: { ...prev!.skills, languages: newLanguages },
                          }));
                        }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResumeFormField
                        label="Proficiency"
                        value={language.proficiency}
                        onChange={(value) => {
                          const newLanguages = [...resume.skills.languages];
                          newLanguages[index] = { ...language, proficiency: value };
                          setResume(prev => ({
                            ...prev!,
                            skills: { ...prev!.skills, languages: newLanguages },
                          }));
                        }}
                        type="select"
                        options={[
                          { value: 'Basic', label: 'Basic' },
                          { value: 'Conversational', label: 'Conversational' },
                          { value: 'Fluent', label: 'Fluent' },
                          { value: 'Native', label: 'Native' },
                        ]}
                        required
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                variant="outlined"
                onClick={() => addArrayItem('skills', 'languages', {
                  name: '',
                  proficiency: 'Basic',
                })}
              >
                Add Language
              </Button>
            </Grid>
          </Grid>
        );

      default:
        return (
          <Typography variant="body1">
            Step {step + 1} content will be implemented in the next iteration.
          </Typography>
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h4" component="h1">
          Resume Builder
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={saveResume}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Resume'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={() => setPreviewOpen(true)}
        >
          Preview
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={generatePDF}
        >
          Generate PDF
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
            disabled={activeStep === steps.length - 1}
          >
            Next
          </Button>
        </Box>
      </Paper>

      {/* Resume Settings */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resume Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={resume?.visibility.public || false}
                  onChange={(e) => updateResumeField('visibility', 'public', e.target.checked)}
                />
              }
              label="Make resume public"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={resume?.visibility.recruitersOnly || false}
                  onChange={(e) => updateResumeField('visibility', 'recruitersOnly', e.target.checked)}
                />
              }
              label="Visible to recruiters only"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resume Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Resume preview functionality will be implemented in the next iteration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeBuilder;
