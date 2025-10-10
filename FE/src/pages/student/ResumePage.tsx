import { Container, Grid, Card, CardContent, Typography, Button, Box, TextField, Chip, Alert, LinearProgress } from '@mui/material';
import { Upload, Download, Edit, Visibility, CheckCircle, Warning } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState } from 'react';

const ResumePage = () => {
  const [resumeData] = useState({
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@college.edu',
      phone: '+91 9876543210',
      location: 'Mumbai, Maharashtra',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe'
    },
    education: {
      degree: 'Bachelor of Technology',
      field: 'Computer Science',
      college: 'Indian Institute of Technology Bombay',
      cgpa: '8.5',
      year: '2024'
    },
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Python', 'Java', 'SQL', 'Git'],
    projects: [
      {
        title: 'E-commerce Platform',
        description: 'Full-stack web application with React frontend and Node.js backend',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        duration: '3 months'
      },
      {
        title: 'Task Management App',
        description: 'Mobile-responsive task management application with real-time updates',
        technologies: ['React', 'Firebase', 'Material-UI'],
        duration: '2 months'
      }
    ],
    experience: [
      {
        company: 'Tech Internship Co.',
        position: 'Software Development Intern',
        duration: 'Summer 2023',
        description: 'Worked on frontend development using React and contributed to API development'
      }
    ],
    achievements: [
      'Won 1st prize in college hackathon',
      'Completed Google Cloud certification',
      'Published 2 research papers in international journals'
    ]
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const downloadResume = () => {
    // Simulate download
    console.log('Downloading resume...');
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Resume Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={downloadResume}>
              Download PDF
            </Button>
            <Button variant="contained" startIcon={<Edit />}>
              Edit Resume
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={resumeData.personalInfo.name}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={resumeData.personalInfo.email}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={resumeData.personalInfo.phone}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={resumeData.personalInfo.location}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Degree"
                      value={resumeData.education.degree}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Field of Study"
                      value={resumeData.education.field}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="College"
                      value={resumeData.education.college}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="CGPA"
                      value={resumeData.education.cgpa}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Year"
                      value={resumeData.education.year}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {resumeData.skills.map((skill, index) => (
                    <Chip key={index} label={skill} color="primary" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Projects
                </Typography>
                {resumeData.projects.map((project, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {project.technologies.map((tech, techIndex) => (
                        <Chip key={techIndex} label={tech} size="small" color="secondary" />
                      ))}
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Duration: {project.duration}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload New Resume
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="resume-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      disabled={isUploading}
                    >
                      Choose File
                    </Button>
                  </label>
                </Box>
                
                {isUploading && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Uploading... {uploadProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}

                {uploadProgress === 100 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Resume uploaded successfully!
                  </Alert>
                )}

                <Typography variant="body2" color="textSecondary">
                  Supported formats: PDF, DOC, DOCX
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resume Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Profile Complete</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Skills Added</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Projects Listed</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="body2">Add More Experience</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="outlined" startIcon={<Visibility />} fullWidth>
                    Preview Resume
                  </Button>
                  <Button variant="outlined" startIcon={<Download />} fullWidth>
                    Download Template
                  </Button>
                  <Button variant="outlined" startIcon={<Edit />} fullWidth>
                    Edit Skills
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default ResumePage;
