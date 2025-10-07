import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  Person,
  Business,
  School,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { authService } from '../../services/authService';
import { setCredentials } from '../../features/auth/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: '',
    // Student details
    studentDetails: {
      courseName: '',
      college: '',
      cgpa: '',
      yearOfCompletion: '',
      registrationNumber: '',
    },
    // Recruiter details
    recruiterDetails: {
      companyName: '',
      industry: '',
      designation: '',
      companyInfo: '',
    },
    // TnP details
    tnpDetails: {
      college: '',
      designation: '',
      employeeId: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [colleges, setColleges] = useState([]);

  const steps = ['Basic Information', 'Role Selection', 'Role Details'];

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/colleges');
      const data = await response.json();
      setColleges(data.data || []);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name.startsWith('studentDetails.') || 
        name.startsWith('recruiterDetails.') || 
        name.startsWith('tnpDetails.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate basic info
      if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.mobileNumber.length !== 10) {
        setError('Mobile number must be 10 digits');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.role) {
        setError('Please select a role');
        return;
      }
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare data based on role
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'Student') {
        registrationData.studentDetails = {
          ...formData.studentDetails,
          cgpa: formData.studentDetails.cgpa ? parseFloat(formData.studentDetails.cgpa) : undefined,
          yearOfCompletion: formData.studentDetails.yearOfCompletion ? parseInt(formData.studentDetails.yearOfCompletion) : undefined,
        };
      } else if (formData.role === 'Recruiter') {
        registrationData.recruiterDetails = formData.recruiterDetails;
      } else if (formData.role === 'TnP') {
        registrationData.tnpDetails = formData.tnpDetails;
      }

      console.log('Registration data being sent:', registrationData);
      const data = await authService.register(registrationData);
      dispatch(setCredentials(data));
      
      // Redirect based on user role
      switch (data.user.role) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Recruiter':
          navigate('/recruiter/dashboard');
          break;
        case 'TnP':
          navigate('/tnp/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Enter 10-digit mobile number"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Minimum 6 characters"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose your role
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.role === 'Student' ? 2 : 1,
                    borderColor: formData.role === 'Student' ? 'primary.main' : 'grey.300',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'Student' }))}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Student</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apply for jobs and build your career
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.role === 'Recruiter' ? 2 : 1,
                    borderColor: formData.role === 'Recruiter' ? 'primary.main' : 'grey.300',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'Recruiter' }))}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Business sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Recruiter</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Post jobs and find talent
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.role === 'TnP' ? 2 : 1,
                    borderColor: formData.role === 'TnP' ? 'primary.main' : 'grey.300',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'TnP' }))}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Person sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">TnP Officer</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage placements and students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {formData.role && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip
                  label={`Selected: ${formData.role}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formData.role} Details
            </Typography>
            
                {formData.role === 'Student' && (
                  <Box>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Course Name</InputLabel>
                      <Select
                        name="studentDetails.courseName"
                        value={formData.studentDetails.courseName}
                        onChange={handleChange}
                        label="Course Name"
                      >
                        <MenuItem value="Computer Science Engineering">Computer Science Engineering</MenuItem>
                        <MenuItem value="Information Technology">Information Technology</MenuItem>
                        <MenuItem value="Electronics and Communication Engineering">Electronics and Communication Engineering</MenuItem>
                        <MenuItem value="Mechanical Engineering">Mechanical Engineering</MenuItem>
                        <MenuItem value="Civil Engineering">Civil Engineering</MenuItem>
                        <MenuItem value="Electrical Engineering">Electrical Engineering</MenuItem>
                        <MenuItem value="Chemical Engineering">Chemical Engineering</MenuItem>
                        <MenuItem value="Aerospace Engineering">Aerospace Engineering</MenuItem>
                        <MenuItem value="Biotechnology">Biotechnology</MenuItem>
                        <MenuItem value="Business Administration">Business Administration</MenuItem>
                        <MenuItem value="Commerce">Commerce</MenuItem>
                        <MenuItem value="Arts">Arts</MenuItem>
                        <MenuItem value="Science">Science</MenuItem>
                      </Select>
                    </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>College</InputLabel>
                  <Select
                    name="studentDetails.college"
                    value={formData.studentDetails.college}
                    onChange={handleChange}
                    label="College"
                  >
                    {colleges.map((college: any) => (
                      <MenuItem key={college._id} value={college._id}>
                        {college.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="CGPA"
                  name="studentDetails.cgpa"
                  type="number"
                  value={formData.studentDetails.cgpa}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                />
                <TextField
                  fullWidth
                  label="Year of Completion"
                  name="studentDetails.yearOfCompletion"
                  type="number"
                  value={formData.studentDetails.yearOfCompletion}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 2020, max: 2030 }}
                />
                <TextField
                  fullWidth
                  label="Registration Number"
                  name="studentDetails.registrationNumber"
                  value={formData.studentDetails.registrationNumber}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            )}

            {formData.role === 'Recruiter' && (
              <Box>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="recruiterDetails.companyName"
                  value={formData.recruiterDetails.companyName}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Industry"
                  name="recruiterDetails.industry"
                  value={formData.recruiterDetails.industry}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Designation"
                  name="recruiterDetails.designation"
                  value={formData.recruiterDetails.designation}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Company Info"
                  name="recruiterDetails.companyInfo"
                  value={formData.recruiterDetails.companyInfo}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Box>
            )}

            {formData.role === 'TnP' && (
              <Box>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>College</InputLabel>
                  <Select
                    name="tnpDetails.college"
                    value={formData.tnpDetails.college}
                    onChange={handleChange}
                    label="College"
                  >
                    {colleges.map((college: any) => (
                      <MenuItem key={college._id} value={college._id}>
                        {college.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Designation"
                  name="tnpDetails.designation"
                  value={formData.tnpDetails.designation}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="tnpDetails.employeeId"
                  value={formData.tnpDetails.employeeId}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Join HireMe
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Create your account in 3 simple steps
        </Typography>

        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {renderStepContent(currentStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={currentStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForward />}
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link href="/login" variant="body2">
            Already have an account? Login
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;

