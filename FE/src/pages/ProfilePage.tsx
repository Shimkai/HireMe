import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Cancel, 
  Person, 
  School, 
  Work, 
  Business, 
  Add, 
  Delete, 
  Upload,
  AttachFile,
  Download,
  CameraAlt
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { User, StudentDetails, RecruiterDetails, TnPDetails } from '../types';
import { collegeService, College } from '../services/collegeService';
import { userService } from '../services/userService';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    profileAvatar: user?.profileAvatar || '',
    // Student specific
    courseName: user?.studentDetails?.courseName || '',
    college: user?.studentDetails?.college || '',
    cgpa: user?.studentDetails?.cgpa || '',
    yearOfCompletion: user?.studentDetails?.yearOfCompletion || '',
    registrationNumber: user?.studentDetails?.registrationNumber || '',
    skills: user?.studentDetails?.skills || [],
    tenthPercentage: user?.studentDetails?.tenthPercentage || '',
    twelfthPercentage: user?.studentDetails?.twelfthPercentage || '',
    projects: user?.studentDetails?.projects || [],
    // Recruiter specific
    companyName: user?.recruiterDetails?.companyName || '',
    industry: user?.recruiterDetails?.industry || '',
    designation: user?.recruiterDetails?.designation || '',
    companyInfo: user?.recruiterDetails?.companyInfo || '',
    companyWebsite: user?.recruiterDetails?.companyWebsite || '',
    // TnP specific
    tnpDesignation: user?.tnpDetails?.designation || '',
    employeeId: user?.tnpDetails?.employeeId || '',
    tnpCollege: user?.tnpDetails?.college || '',
  });

  // Additional state for file uploads and projects
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
    duration: '',
  });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegesData = await collegeService.getColleges();
        setColleges(collegesData);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (event: any, newValue: string[]) => {
    setFormData(prev => ({
      ...prev,
      skills: newValue,
    }));
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    setPhotoUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Simulate upload progress
      const uploadPromise = new Promise<void>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setPhotoUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 200);

        // Make actual API call
        api.put('/users/me/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then((response) => {
          clearInterval(interval);
          setPhotoUploadProgress(100);
          
          // Update form data with new avatar URL
          setFormData(prev => ({
            ...prev,
            profileAvatar: response.data.data.profileAvatar,
          }));

          // Update user context
          if (updateUser) {
            updateUser({ ...user, profileAvatar: response.data.data.profileAvatar } as User);
          }

          setSuccess('Profile photo uploaded successfully!');
          resolve();
        }).catch((error) => {
          clearInterval(interval);
          reject(error);
        });
      });

      await uploadPromise;
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
      setPhotoUploadProgress(0);
    }
  };

  const handleFileUpload = async (file: File, type: 'tenthMarksheet' | 'twelfthMarksheet' | 'lastSemMarksheet') => {
    setUploadingFiles(prev => ({ ...prev, [type]: true }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Simulate file upload with progress
      const uploadPromise = new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(prev => ({ ...prev, [type]: progress }));
          if (progress >= 100) {
            clearInterval(interval);
            resolve({
              filename: `${type}_${Date.now()}.pdf`,
              originalName: file.name,
              path: `/uploads/${type}_${Date.now()}.pdf`,
              uploadedAt: new Date().toISOString(),
            });
          }
        }, 200);
      });

      const result = await uploadPromise;
      
      // Update form data with uploaded file info
      setFormData(prev => ({
        ...prev,
        [type]: result,
      }));

      setSuccess(`${type.replace(/([A-Z])/g, ' $1').toLowerCase()} uploaded successfully!`);
    } catch (error) {
      setError(`Failed to upload ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [type]: false }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setNewProject({
      title: '',
      description: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      duration: '',
    });
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setNewProject(project);
    setProjectDialogOpen(true);
  };

  const handleSaveProject = () => {
    if (editingProject) {
      // Update existing project
      setFormData(prev => ({
        ...prev,
        projects: prev.projects.map((p, index) => 
          prev.projects.indexOf(editingProject) === index ? newProject : p
        ),
      }));
    } else {
      // Add new project
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
      }));
    }
    setProjectDialogOpen(false);
    setSuccess('Project saved successfully!');
  };

  const handleDeleteProject = (projectToDelete: any) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p !== projectToDelete),
    }));
    setSuccess('Project deleted successfully!');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      profileAvatar: user?.profileAvatar || '',
      courseName: user?.studentDetails?.courseName || '',
      college: user?.studentDetails?.college || '',
      cgpa: user?.studentDetails?.cgpa || '',
      yearOfCompletion: user?.studentDetails?.yearOfCompletion || '',
      registrationNumber: user?.studentDetails?.registrationNumber || '',
      skills: user?.studentDetails?.skills || [],
      tenthPercentage: user?.studentDetails?.tenthPercentage || '',
      twelfthPercentage: user?.studentDetails?.twelfthPercentage || '',
      projects: user?.studentDetails?.projects || [],
      companyName: user?.recruiterDetails?.companyName || '',
      industry: user?.recruiterDetails?.industry || '',
      designation: user?.recruiterDetails?.designation || '',
      companyInfo: user?.recruiterDetails?.companyInfo || '',
      companyWebsite: user?.recruiterDetails?.companyWebsite || '',
      tnpDesignation: user?.tnpDetails?.designation || '',
      employeeId: user?.tnpDetails?.employeeId || '',
      tnpCollege: user?.tnpDetails?.college || '',
    });
    setUploadingPhoto(false);
    setPhotoUploadProgress(0);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare update data based on user role
      let updateData: any = {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        profileAvatar: formData.profileAvatar,
      };

      if (user?.role === 'Student') {
        updateData.studentDetails = {
          courseName: formData.courseName,
          college: formData.college,
          cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
          yearOfCompletion: formData.yearOfCompletion ? parseInt(formData.yearOfCompletion) : undefined,
          registrationNumber: formData.registrationNumber,
          skills: formData.skills,
          tenthPercentage: formData.tenthPercentage ? parseFloat(formData.tenthPercentage) : undefined,
          twelfthPercentage: formData.twelfthPercentage ? parseFloat(formData.twelfthPercentage) : undefined,
          projects: formData.projects,
          // Include uploaded files
          tenthMarksheet: formData.tenthMarksheet,
          twelfthMarksheet: formData.twelfthMarksheet,
          lastSemMarksheet: formData.lastSemMarksheet,
        };
      } else if (user?.role === 'Recruiter') {
        updateData.recruiterDetails = {
          companyName: formData.companyName,
          industry: formData.industry,
          designation: formData.designation,
          companyInfo: formData.companyInfo,
          companyWebsite: formData.companyWebsite,
        };
      } else if (user?.role === 'TnP') {
        updateData.tnpDetails = {
          college: formData.tnpCollege,
          designation: formData.tnpDesignation,
          employeeId: formData.employeeId,
        };
      }

      // Make API call to update the user
      const updatedUser = await userService.updateProfile(updateData);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Update the user context with new data
      if (updateUser) {
        updateUser(updatedUser);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'Student':
        return <School />;
      case 'Recruiter':
        return <Work />;
      case 'TnP':
        return <Business />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'Student':
        return 'primary';
      case 'Recruiter':
        return 'success';
      case 'TnP':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCollegeName = () => {
    if (user?.role === 'Student' && user?.studentDetails?.college) {
      const college = colleges.find(c => c._id === user.studentDetails?.college);
      return college?.name || 'College not found';
    } else if (user?.role === 'TnP' && user?.tnpDetails?.college) {
      const college = colleges.find(c => c._id === user.tnpDetails?.college);
      return college?.name || 'College not found';
    }
    return 'N/A';
  };

  if (!user) {
    return (
      <MainLayout>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            My Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your personal information and account details
          </Typography>
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

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', mr: 3 }}>
                    <Avatar
                      sx={{ width: 80, height: 80 }}
                      src={formData.profileAvatar}
                    >
                      {user.fullName.charAt(0)}
                    </Avatar>
                    {isEditing && (
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="profile-photo"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(file);
                          }}
                        />
                        <label htmlFor="profile-photo">
                          <IconButton
                            sx={{
                              position: 'absolute',
                              bottom: -5,
                              right: -5,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                              width: 32,
                              height: 32,
                            }}
                            component="span"
                            disabled={uploadingPhoto}
                          >
                            <CameraAlt fontSize="small" />
                          </IconButton>
                        </label>
                        {uploadingPhoto && (
                          <LinearProgress 
                            variant="determinate" 
                            value={photoUploadProgress} 
                            sx={{ 
                              position: 'absolute',
                              bottom: -8,
                              left: 0,
                              right: 0,
                              height: 3
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {user.fullName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Chip
                        icon={getRoleIcon()}
                        label={user.role}
                        color={getRoleColor() as any}
                        variant="outlined"
                      />
                      <Typography variant="body2" color="textSecondary">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>College:</strong> {getCollegeName()}
                    </Typography>
                  </Box>
                  <Box>
                    {!isEditing ? (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="College"
                    value={getCollegeName()}
                    disabled
                    helperText="College cannot be changed"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Role-specific Information */}
          {user.role === 'Student' && (
            <>
              {/* Basic Student Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Course Name"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="CGPA"
                        name="cgpa"
                        type="number"
                        value={formData.cgpa}
                        onChange={handleChange}
                        disabled={!isEditing}
                        inputProps={{ min: 0, max: 10, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Year of Completion"
                        name="yearOfCompletion"
                        type="number"
                        value={formData.yearOfCompletion}
                        onChange={handleChange}
                        disabled={!isEditing}
                        inputProps={{ min: 2020, max: 2030 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Registration Number"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Academic Performance */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Academic Performance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="10th Percentage"
                        name="tenthPercentage"
                        type="number"
                        value={formData.tenthPercentage}
                        onChange={handleChange}
                        disabled={!isEditing}
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        helperText="Enter your 10th standard percentage"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="12th Percentage"
                        name="twelfthPercentage"
                        type="number"
                        value={formData.twelfthPercentage}
                        onChange={handleChange}
                        disabled={!isEditing}
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        helperText="Enter your 12th standard percentage"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Skills Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[
                      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB', 'SQL',
                      'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js', 'Express.js', 'Django',
                      'Flask', 'Spring Boot', 'Android', 'iOS', 'Machine Learning', 'Data Science',
                      'AWS', 'Docker', 'Git', 'Linux', 'Agile', 'Scrum'
                    ]}
                    value={formData.skills}
                    onChange={handleSkillsChange}
                    disabled={!isEditing}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Add Skills"
                        placeholder="Type to add skills..."
                        helperText="Add your technical and soft skills"
                      />
                    )}
                  />
                </Paper>
              </Grid>

              {/* File Upload Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Academic Documents
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {/* 10th Marksheet */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          10th Marksheet
                        </Typography>
                        {formData.tenthMarksheet ? (
                          <Box>
                            <Chip
                              icon={<AttachFile />}
                              label={formData.tenthMarksheet.originalName}
                              color="success"
                              sx={{ mb: 1 }}
                            />
                            <br />
                            <Button
                              size="small"
                              startIcon={<Download />}
                              disabled={!isEditing}
                            >
                              Download
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <input
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              id="tenth-marksheet"
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'tenthMarksheet');
                              }}
                              disabled={!isEditing}
                            />
                            <label htmlFor="tenth-marksheet">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<Upload />}
                                disabled={!isEditing || uploadingFiles.tenthMarksheet}
                                fullWidth
                              >
                                Upload 10th Marksheet
                              </Button>
                            </label>
                            {uploadingFiles.tenthMarksheet && (
                              <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress.tenthMarksheet} 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* 12th Marksheet */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          12th Marksheet
                        </Typography>
                        {formData.twelfthMarksheet ? (
                          <Box>
                            <Chip
                              icon={<AttachFile />}
                              label={formData.twelfthMarksheet.originalName}
                              color="success"
                              sx={{ mb: 1 }}
                            />
                            <br />
                            <Button
                              size="small"
                              startIcon={<Download />}
                              disabled={!isEditing}
                            >
                              Download
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <input
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              id="twelfth-marksheet"
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'twelfthMarksheet');
                              }}
                              disabled={!isEditing}
                            />
                            <label htmlFor="twelfth-marksheet">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<Upload />}
                                disabled={!isEditing || uploadingFiles.twelfthMarksheet}
                                fullWidth
                              >
                                Upload 12th Marksheet
                              </Button>
                            </label>
                            {uploadingFiles.twelfthMarksheet && (
                              <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress.twelfthMarksheet} 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* Last Semester Marksheet */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Last Semester Marksheet
                        </Typography>
                        {formData.lastSemMarksheet ? (
                          <Box>
                            <Chip
                              icon={<AttachFile />}
                              label={formData.lastSemMarksheet.originalName}
                              color="success"
                              sx={{ mb: 1 }}
                            />
                            <br />
                            <Button
                              size="small"
                              startIcon={<Download />}
                              disabled={!isEditing}
                            >
                              Download
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <input
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              id="last-sem-marksheet"
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'lastSemMarksheet');
                              }}
                              disabled={!isEditing}
                            />
                            <label htmlFor="last-sem-marksheet">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<Upload />}
                                disabled={!isEditing || uploadingFiles.lastSemMarksheet}
                                fullWidth
                              >
                                Upload Last Sem Marksheet
                              </Button>
                            </label>
                            {uploadingFiles.lastSemMarksheet && (
                              <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress.lastSemMarksheet} 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Projects Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Projects
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddProject}
                      disabled={!isEditing}
                    >
                      Add Project
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {formData.projects.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      No projects added yet. Click "Add Project" to get started.
                    </Typography>
                  ) : (
                    <List>
                      {formData.projects.map((project, index) => (
                        <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <ListItemText
                            primary={project.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                  {project.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {project.technologies.map((tech, techIndex) => (
                                    <Chip key={techIndex} label={tech} size="small" variant="outlined" />
                                  ))}
                                </Box>
                                {project.duration && (
                                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                    Duration: {project.duration}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleEditProject(project)}
                              disabled={!isEditing}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteProject(project)}
                              disabled={!isEditing}
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </>
          )}

          {user.role === 'Recruiter' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Company Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://www.company.com"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Information"
                      name="companyInfo"
                      value={formData.companyInfo}
                      onChange={handleChange}
                      disabled={!isEditing}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {user.role === 'TnP' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Training & Placement Officer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      name="tnpDesignation"
                      value={formData.tnpDesignation}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Project Dialog */}
        <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={newProject.duration}
                  onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 3 months, 6 weeks"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[
                    'React', 'Node.js', 'Python', 'JavaScript', 'Java', 'C++', 'MongoDB', 'SQL',
                    'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js', 'Express.js', 'Django',
                    'Flask', 'Spring Boot', 'Android', 'iOS', 'Machine Learning', 'AWS', 'Docker'
                  ]}
                  value={newProject.technologies}
                  onChange={(event, newValue) => setNewProject(prev => ({ ...prev, technologies: newValue }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Technologies Used"
                      placeholder="Add technologies..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub URL"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/project"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Live Demo URL"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject(prev => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="https://project-demo.com"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProject} 
              variant="contained"
              disabled={!newProject.title || !newProject.description}
            >
              {editingProject ? 'Update' : 'Add'} Project
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default ProfilePage;
