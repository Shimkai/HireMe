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
  Autocomplete,
  Chip,
} from '@mui/material';
import { authService } from '../../services/authService';
import { setCredentials } from '../../features/auth/authSlice';
import { collegeService, College } from '../../services/collegeService';
import { PREDEFINED_SKILLS } from '../../constants/skills';

// Predefined list of courses for student registration
const PREDEFINED_COURSES = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence',
  'AIML',
  'Data Science',
  'Cyber Security',
  'ENTC',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electronics Engineering',
  'Robotics',
  'Automation',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biomedical Engineering',
];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: '',
    verificationPasskey: '', // Added for Recruiter and TnP
    studentDetails: {
      courseName: '',
      college: null as College | null,
      cgpa: '',
      yearOfCompletion: '',
      registrationNumber: '',
      skills: [] as string[],
    },
    recruiterDetails: {
      companyName: '',
      industry: '',
      designation: '',
      companyInfo: '',
      companyWebsite: '',
    },
    tnpDetails: {
      college: null as College | null,
      designation: '',
      employeeId: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const displayCollegeName = (college: College) => college.name;

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegesData = await collegeService.getColleges();
        // Sort A-Z
        collegesData.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Colleges loaded:', collegesData);
        setColleges(collegesData);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    // If role is changing, clear verification passkey
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        verificationPasskey: '', // Clear passkey when role changes
      }));
      return;
    }
    
    // Handle nested objects for role-specific details
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey as keyof typeof prev] as any,
          [childKey]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCollegeChange = (field: 'studentDetails.college' | 'tnpDetails.college', value: College | null) => {
    const [parentKey, childKey] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey as keyof typeof prev] as any,
        [childKey]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate verification passkey for Recruiter and TnP
      if (formData.role === 'Recruiter' || formData.role === 'TnP') {
        const expectedPasskey = formData.role === 'Recruiter' ? 'recruiterverify' : 'tnpverify';
        if (formData.verificationPasskey !== expectedPasskey) {
          setError('Invalid verification passkey. Please enter the correct passkey.');
          setLoading(false);
          return;
        }
      }

      // Prepare data based on role
      let submitData: any = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        role: formData.role,
      };

      // Add verification passkey for Recruiter and TnP
      if (formData.role === 'Recruiter' || formData.role === 'TnP') {
        submitData.verificationPasskey = formData.verificationPasskey;
      }

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
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Join HireMe
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Create your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
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
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} onChange={handleChange} label="Role">
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Recruiter">Recruiter</MenuItem>
              <MenuItem value="TnP">Training & Placement Officer</MenuItem>
            </Select>
          </FormControl>

          {/* Student Details */}
          {formData.role === 'Student' && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }} color="primary">
                Student Information
              </Typography>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Course Name</InputLabel>
                <Select
                  label="Course Name"
                  name="studentDetails.courseName"
                  value={formData.studentDetails.courseName}
                  onChange={handleChange}
                >
                  {PREDEFINED_COURSES.map((course) => (
                    <MenuItem key={course} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                fullWidth
                options={colleges}
                getOptionLabel={(option) => displayCollegeName(option)}
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
                inputProps={{ dir: 'ltr' }}
              />
              <Autocomplete
                multiple
                fullWidth
                options={PREDEFINED_SKILLS}
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
                label="Verification Passkey"
                name="verificationPasskey"
                type="password"
                value={formData.verificationPasskey}
                onChange={handleChange}
                margin="normal"
                required
                error={formData.verificationPasskey && formData.verificationPasskey !== 'recruiterverify'}
              />
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
              <TextField
                fullWidth
                label="Verification Passkey"
                name="verificationPasskey"
                type="password"
                value={formData.verificationPasskey}
                onChange={handleChange}
                margin="normal"
                required
                error={formData.verificationPasskey && formData.verificationPasskey !== 'tnpverify'}
              />
              <Autocomplete
                fullWidth
                options={colleges}
                getOptionLabel={(option) => displayCollegeName(option)}
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
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;

