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
<<<<<<< HEAD
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
=======
  Autocomplete,
>>>>>>> 9b124f5 (report and student recommendation)
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
import { collegeService, College } from '../../services/collegeService';

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
<<<<<<< HEAD
    // Student details
    studentDetails: {
      courseName: '',
      college: '',
      cgpa: '',
      yearOfCompletion: '',
      registrationNumber: '',
    },
    // Recruiter details
=======
    studentDetails: {
      courseName: '',
      college: null as College | null,
      cgpa: '',
      yearOfCompletion: '',
      registrationNumber: '',
      skills: [] as string[],
    },
>>>>>>> 9b124f5 (report and student recommendation)
    recruiterDetails: {
      companyName: '',
      industry: '',
      designation: '',
      companyInfo: '',
<<<<<<< HEAD
    },
    // TnP details
    tnpDetails: {
      college: '',
=======
      companyWebsite: '',
    },
    tnpDetails: {
      college: null as College | null,
>>>>>>> 9b124f5 (report and student recommendation)
      designation: '',
      employeeId: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
<<<<<<< HEAD
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
=======
  const [colleges, setColleges] = useState<College[]>([]);

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegesData = await collegeService.getColleges();
        console.log('Colleges loaded:', collegesData);
        setColleges(collegesData);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);
>>>>>>> 9b124f5 (report and student recommendation)

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
<<<<<<< HEAD
    if (name.startsWith('studentDetails.') || 
        name.startsWith('recruiterDetails.') || 
        name.startsWith('tnpDetails.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
=======
    // Handle nested objects for role-specific details
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey as keyof typeof prev] as any,
          [childKey]: value,
>>>>>>> 9b124f5 (report and student recommendation)
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

<<<<<<< HEAD
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
=======
  const handleCollegeChange = (field: 'studentDetails.college' | 'tnpDetails.college', value: College | null) => {
    const [parentKey, childKey] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey as keyof typeof prev] as any,
        [childKey]: value,
      },
    }));
>>>>>>> 9b124f5 (report and student recommendation)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare data based on role
<<<<<<< HEAD
      const registrationData = {
=======
      let submitData: any = {
>>>>>>> 9b124f5 (report and student recommendation)
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        role: formData.role,
      };

<<<<<<< HEAD
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
=======
      // Add role-specific details
      if (formData.role === 'Student') {
        submitData.studentDetails = {
          courseName: formData.studentDetails.courseName,
          college: formData.studentDetails.college?._id,
          cgpa: formData.studentDetails.cgpa ? parseFloat(formData.studentDetails.cgpa) : undefined,
          yearOfCompletion: formData.studentDetails.yearOfCompletion ? parseInt(formData.studentDetails.yearOfCompletion) : undefined,
          registrationNumber: formData.studentDetails.registrationNumber,
          skills: formData.studentDetails.skills,
        };
      } else if (formData.role === 'Recruiter') {
        submitData.recruiterDetails = {
          companyName: formData.recruiterDetails.companyName,
          industry: formData.recruiterDetails.industry,
          designation: formData.recruiterDetails.designation,
          companyInfo: formData.recruiterDetails.companyInfo,
          companyWebsite: formData.recruiterDetails.companyWebsite,
        };
      } else if (formData.role === 'TnP') {
        submitData.tnpDetails = {
          college: formData.tnpDetails.college?._id,
          designation: formData.tnpDetails.designation,
          employeeId: formData.tnpDetails.employeeId,
        };
      }

      // Debug: Log the data being sent
      console.log('Registration data being sent:', submitData);
      console.log('Selected college for student:', formData.studentDetails.college);
      console.log('Selected college for TnP:', formData.tnpDetails.college);

      const data = await authService.register(submitData);
>>>>>>> 9b124f5 (report and student recommendation)
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
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
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

<<<<<<< HEAD
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
=======
          {/* Student Details */}
          {formData.role === 'Student' && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }} color="primary">
                Student Information
              </Typography>
              <TextField
                fullWidth
                label="Course Name"
                name="studentDetails.courseName"
                value={formData.studentDetails.courseName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Autocomplete
                fullWidth
                options={colleges}
                getOptionLabel={(option) => option.name}
                value={formData.studentDetails.college}
                onChange={(_, value) => handleCollegeChange('studentDetails.college', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="College"
                    margin="normal"
                    required
                  />
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
              />
              <TextField
                fullWidth
                label="CGPA"
                name="studentDetails.cgpa"
                type="number"
                value={formData.studentDetails.cgpa}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0, max: 10, step: 0.01 }}
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
              <Autocomplete
                multiple
                fullWidth
                options={[
                  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue.js',
                  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
                  'Azure', 'GCP', 'Machine Learning', 'Data Science', 'Artificial Intelligence',
                  'Blockchain', 'DevOps', 'CI/CD', 'Git', 'Linux', 'TypeScript', 'Express.js',
                  'Spring Boot', 'Django', 'Flask', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
                  'SQL', 'NoSQL', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
                ]}
                value={formData.studentDetails.skills}
                onChange={(_, value) => {
                  setFormData(prev => ({
                    ...prev,
                    studentDetails: {
                      ...prev.studentDetails,
                      skills: value
                    }
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Skills"
                    margin="normal"
                    placeholder="Select your skills"
                    helperText="Select skills that match your expertise"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </>
          )}

          {/* Recruiter Details */}
          {formData.role === 'Recruiter' && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }} color="primary">
                Company Information
              </Typography>
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
              <TextField
                fullWidth
                label="Company Website"
                name="recruiterDetails.companyWebsite"
                value={formData.recruiterDetails.companyWebsite}
                onChange={handleChange}
                margin="normal"
                placeholder="https://www.company.com (optional)"
                helperText="Enter full URL including https:// (optional)"
              />
            </>
          )}

          {/* TnP Details */}
          {formData.role === 'TnP' && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }} color="primary">
                Training & Placement Officer Information
              </Typography>
              <Autocomplete
                fullWidth
                options={colleges}
                getOptionLabel={(option) => option.name}
                value={formData.tnpDetails.college}
                onChange={(_, value) => handleCollegeChange('tnpDetails.college', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="College"
                    margin="normal"
                    required
                  />
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
              />
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
            </>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Already have an account? Login
            </Link>
>>>>>>> 9b124f5 (report and student recommendation)
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

