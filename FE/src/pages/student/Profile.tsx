import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Avatar,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  IconButton,
} from '@mui/material';
import {
  Person,
  Save,
  Edit,
  Upload,
  KeyboardArrowDown,
  Check,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { collegeService } from '../../services/collegeService';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../features/auth/authSlice';

// Predefined areas of interest
const AREAS_OF_INTEREST = [
  'Backend Development',
  'Frontend Development', 
  'Full-Stack Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Testing/QA',
  'UI/UX Design',
  'Database Administration',
  'System Administration',
  'Network Engineering',
  'Software Architecture',
  'Product Management',
  'Business Analysis',
  'Digital Marketing',
  'Content Writing',
  'Graphic Design',
  'Video Editing',
  'Photography',
  'Other'
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tempAreaOfInterest, setTempAreaOfInterest] = useState<string[]>([]);

   const [profileData, setProfileData] = useState({
     fullName: user?.fullName || '',
     email: user?.email || '',
     mobileNumber: user?.mobileNumber || '',
     profileAvatar: user?.profileAvatar || '',
     studentDetails: {
       courseName: user?.studentDetails?.courseName || '',
       college: (() => {
         // Handle both populated college object and college ID
         if (typeof user?.studentDetails?.college === 'object' && user.studentDetails.college?._id) {
           return user.studentDetails.college._id;
         }
         return user?.studentDetails?.college || '';
       })(),
       cgpa: user?.studentDetails?.cgpa || '',
       yearOfCompletion: user?.studentDetails?.yearOfCompletion || '',
       registrationNumber: user?.studentDetails?.registrationNumber || '',
      address: {
        street: user?.studentDetails?.address?.street || '',
        city: user?.studentDetails?.address?.city || '',
        state: user?.studentDetails?.address?.state || '',
        pincode: user?.studentDetails?.address?.pincode || '',
        country: user?.studentDetails?.address?.country || 'India',
      },
      tenthMarks: {
        percentage: user?.studentDetails?.tenthMarks?.percentage || '',
        marksheet: user?.studentDetails?.tenthMarks?.marksheet || '',
      },
      twelfthMarks: {
        percentage: user?.studentDetails?.twelfthMarks?.percentage || '',
        marksheet: user?.studentDetails?.twelfthMarks?.marksheet || '',
      },
      lastSemesterMarksheet: user?.studentDetails?.lastSemesterMarksheet || '',
      areaOfInterest: user?.studentDetails?.areaOfInterest || [],
    },
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    // Update profile data when user changes, but preserve current profileAvatar if it exists
    console.log('useEffect triggered - user changed:', user);
    setProfileData(prev => {
      const newData = {
        fullName: user?.fullName || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '',
        profileAvatar: user?.profileAvatar || prev.profileAvatar || '',
         studentDetails: {
           courseName: user?.studentDetails?.courseName || '',
           college: (() => {
             // Handle both populated college object and college ID
             if (typeof user?.studentDetails?.college === 'object' && user.studentDetails.college?._id) {
               return user.studentDetails.college._id;
             }
             return user?.studentDetails?.college || '';
           })(),
           cgpa: user?.studentDetails?.cgpa || '',
           yearOfCompletion: user?.studentDetails?.yearOfCompletion || '',
           registrationNumber: user?.studentDetails?.registrationNumber || '',
          address: {
            street: user?.studentDetails?.address?.street || prev.studentDetails?.address?.street || '',
            city: user?.studentDetails?.address?.city || prev.studentDetails?.address?.city || '',
            state: user?.studentDetails?.address?.state || prev.studentDetails?.address?.state || '',
            pincode: user?.studentDetails?.address?.pincode || prev.studentDetails?.address?.pincode || '',
            country: user?.studentDetails?.address?.country || prev.studentDetails?.address?.country || 'India',
          },
          tenthMarks: {
            percentage: user?.studentDetails?.tenthMarks?.percentage || prev.studentDetails?.tenthMarks?.percentage || '',
            marksheet: user?.studentDetails?.tenthMarks?.marksheet || prev.studentDetails?.tenthMarks?.marksheet || '',
          },
          twelfthMarks: {
            percentage: user?.studentDetails?.twelfthMarks?.percentage || prev.studentDetails?.twelfthMarks?.percentage || '',
            marksheet: user?.studentDetails?.twelfthMarks?.marksheet || prev.studentDetails?.twelfthMarks?.marksheet || '',
          },
          lastSemesterMarksheet: user?.studentDetails?.lastSemesterMarksheet || prev.studentDetails?.lastSemesterMarksheet || '',
          areaOfInterest: user?.studentDetails?.areaOfInterest || prev.studentDetails?.areaOfInterest || [],
        },
      };
      console.log('Profile data updated:', newData.profileAvatar);
      return newData;
    });
  }, [user]);

  const fetchColleges = async () => {
    try {
      console.log('Fetching colleges...');
      const response = await collegeService.getAllColleges();
      console.log('Colleges response:', response);
      setColleges(response.data || []);
      console.log('Colleges set:', response.data?.length || 0);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
      // Set empty array as fallback
      setColleges([]);
    }
  };

  const courses = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Business Administration',
    'Commerce',
    'Arts',
    'Science',
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        // Handle cases like 'studentDetails.courseName'
        const [parent, child] = parts;
        setProfileData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        }));
      } else if (parts.length === 3) {
        // Handle cases like 'studentDetails.address.street' or 'studentDetails.tenthMarks.percentage'
        const [parent, child, grandchild] = parts;
        setProfileData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: {
              ...(prev[parent as keyof typeof prev] as any)?.[child],
              [grandchild]: value,
            },
          },
        }));
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAreaOfInterestChange = (event: any) => {
    const value = event.target.value;
    setProfileData(prev => ({
      ...prev,
      studentDetails: {
        ...prev.studentDetails,
        areaOfInterest: typeof value === 'string' ? value.split(',') : value,
      },
    }));
  };

  const handleAreaOfInterestClick = (event: React.MouseEvent<HTMLElement>) => {
    if (editing) {
      setAnchorEl(event.currentTarget);
      setTempAreaOfInterest([...profileData.studentDetails.areaOfInterest]);
    }
  };

  const handleAreaOfInterestClose = () => {
    setAnchorEl(null);
  };

  const handleAreaOfInterestToggle = (area: string) => {
    setTempAreaOfInterest(prev => 
      prev.includes(area) 
        ? prev.filter(item => item !== area)
        : [...prev, area]
    );
  };

  const handleAreaOfInterestSelect = () => {
    setProfileData(prev => ({
      ...prev,
      studentDetails: {
        ...prev.studentDetails,
        areaOfInterest: tempAreaOfInterest,
      },
    }));
    setAnchorEl(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Remove email from profileData as it shouldn't be updatable
      const { email, ...updateData } = profileData;
      console.log('Saving profile data:', updateData);
      
      const response = await userService.updateProfile(updateData as any);
      console.log('Profile update response:', response.data);
      
      dispatch(updateUser(response.data));
      setSuccess('Profile updated successfully! However, your account has been marked as unverified and requires TnP approval to apply for jobs.');
      setEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        setError(null);
        
        console.log('File selected:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file');
          return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB');
          return;
        }
        
        console.log('Uploading file...');
        const response = await userService.uploadAvatar(file);
        console.log('Upload response:', response);
        
        // Update the user's profile avatar in Redux store
        const updatedUser = { ...user, profileAvatar: response.data.profileAvatar };
        dispatch(updateUser(updatedUser));
        
        // Update local profile data state
        setProfileData(prev => ({
          ...prev,
          profileAvatar: response.data.profileAvatar
        }));
        
        setSuccess('Profile photo updated successfully! However, your account has been marked as unverified and requires TnP approval to apply for jobs.');
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.response?.data?.error?.message || 'Failed to upload photo');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTenthMarksheetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        setError(null);
        
        if (!file.type.includes('pdf') && !file.type.includes('image/')) {
          setError('Please select a PDF or image file');
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          return;
        }
        
        const response = await userService.uploadTenthMarksheet(file);
        console.log('Current tenthMarks before update:', profileData.studentDetails.tenthMarks);
        console.log('Response data:', response.data.tenthMarks);
        // Preserve existing percentage while updating marksheet
        const updatedTenthMarks = {
          ...profileData.studentDetails.tenthMarks,
          marksheet: response.data.tenthMarks.marksheet
        };
        console.log('Updated tenthMarks:', updatedTenthMarks);
        dispatch(updateUser({ ...user, studentDetails: { ...user?.studentDetails, tenthMarks: updatedTenthMarks } }));
        setProfileData(prev => ({
          ...prev,
          studentDetails: {
            ...prev.studentDetails,
            tenthMarks: updatedTenthMarks
          }
        }));
        setSuccess('Tenth marksheet uploaded successfully! However, your account has been marked as unverified and requires TnP approval to apply for jobs.');
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to upload marksheet');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTwelfthMarksheetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        setError(null);
        
        if (!file.type.includes('pdf') && !file.type.includes('image/')) {
          setError('Please select a PDF or image file');
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          return;
        }
        
        const response = await userService.uploadTwelfthMarksheet(file);
        console.log('Current twelfthMarks before update:', profileData.studentDetails.twelfthMarks);
        console.log('Response data:', response.data.twelfthMarks);
        // Preserve existing percentage while updating marksheet
        const updatedTwelfthMarks = {
          ...profileData.studentDetails.twelfthMarks,
          marksheet: response.data.twelfthMarks.marksheet
        };
        console.log('Updated twelfthMarks:', updatedTwelfthMarks);
        dispatch(updateUser({ ...user, studentDetails: { ...user?.studentDetails, twelfthMarks: updatedTwelfthMarks } }));
        setProfileData(prev => ({
          ...prev,
          studentDetails: {
            ...prev.studentDetails,
            twelfthMarks: updatedTwelfthMarks
          }
        }));
        setSuccess('Twelfth marksheet uploaded successfully! However, your account has been marked as unverified and requires TnP approval to apply for jobs.');
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to upload marksheet');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleLastSemesterMarksheetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        setError(null);
        
        if (!file.type.includes('pdf') && !file.type.includes('image/')) {
          setError('Please select a PDF or image file');
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          return;
        }
        
        const response = await userService.uploadLastSemesterMarksheet(file);
        dispatch(updateUser({ ...user, studentDetails: { ...user?.studentDetails, lastSemesterMarksheet: response.data.lastSemesterMarksheet } }));
        setProfileData(prev => ({
          ...prev,
          studentDetails: {
            ...prev.studentDetails,
            lastSemesterMarksheet: response.data.lastSemesterMarksheet
          }
        }));
        setSuccess('Last semester marksheet uploaded successfully! However, your account has been marked as unverified and requires TnP approval to apply for jobs.');
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to upload marksheet');
      } finally {
        setSaving(false);
      }
    }
  };


  const getVerificationStatus = () => {
    if (user?.studentDetails?.isVerified) {
      return <Chip label="Verified" color="success" size="small" />;
    }
    return <Chip label="Not Verified" color="warning" size="small" />;
  };

  const getPlacementStatus = () => {
    if (user?.studentDetails?.placementStatus === 'Placed') {
      return <Chip label="Placed" color="success" size="small" />;
    }
    return <Chip label="Not Placed" color="default" size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Person sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        <Box flexGrow={1} />
        {editing ? (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setEditing(false);
                setProfileData({
                  fullName: user?.fullName || '',
                  email: user?.email || '',
                  mobileNumber: user?.mobileNumber || '',
                  profileAvatar: user?.profileAvatar || '',
                  studentDetails: {
                    courseName: user?.studentDetails?.courseName || '',
                    college: user?.studentDetails?.college || '',
                    cgpa: user?.studentDetails?.cgpa || '',
                    yearOfCompletion: user?.studentDetails?.yearOfCompletion || '',
                    registrationNumber: user?.studentDetails?.registrationNumber || '',
                  },
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        )}
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
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
                src={profileData.profileAvatar ? `http://localhost:5000${profileData.profileAvatar}` : undefined}
                onError={() => console.log('Avatar load error for:', profileData.profileAvatar)}
              >
                {profileData.fullName.charAt(0)}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profileData.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.mobileNumber}
              </Typography>
               <Typography variant="body2" color="text.secondary" gutterBottom>
                 {(() => {
                   // Handle both populated college object and college ID
                   let collegeId = profileData.studentDetails.college;
                   
                   // If college is an object, extract the ID
                   if (typeof collegeId === 'object' && collegeId?._id) {
                     collegeId = collegeId._id;
                   }
                   
                   // Try to find college name from colleges list
                   let collegeName = colleges.find((college: any) => college._id === collegeId)?.name;
                   
                   // If not found in colleges list, try to get from user data (populated college)
                   if (!collegeName && typeof user?.studentDetails?.college === 'object' && user.studentDetails.college?.name) {
                     collegeName = user.studentDetails.college.name;
                   }
                   
                   // If still not found, show a more helpful message
                   if (!collegeName) {
                     return collegeId ? `College ID: ${collegeId}` : 'College not selected';
                   }
                   
                   return collegeName;
                 })()}
               </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="center" gap={1} mb={1}>
                {getVerificationStatus()}
                {getPlacementStatus()}
              </Box>
              
              {editing && (
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  component="label"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={!editing}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editing}
                  type="email"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={profileData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  disabled={!editing}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Academic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={profileData.studentDetails.courseName}
                    onChange={(e) => handleInputChange('studentDetails.courseName', e.target.value)}
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                 <FormControl fullWidth disabled={!editing}>
                   <InputLabel>College</InputLabel>
                   <Select
                     value={(() => {
                       // Handle both populated college object and college ID
                       let collegeId = profileData.studentDetails.college;
                       
                       // If college is an object, extract the ID
                       if (typeof collegeId === 'object' && collegeId?._id) {
                         collegeId = collegeId._id;
                       }
                       
                       return collegeId || '';
                     })()}
                     onChange={(e) => {
                       console.log('College changed to:', e.target.value);
                       handleInputChange('studentDetails.college', e.target.value);
                     }}
                     label="College"
                   >
                     {colleges.map((college: any) => (
                       <MenuItem key={college._id} value={college._id}>
                         {college.name}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={profileData.studentDetails.registrationNumber}
                  onChange={(e) => handleInputChange('studentDetails.registrationNumber', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CGPA"
                  value={profileData.studentDetails.cgpa}
                  onChange={(e) => handleInputChange('studentDetails.cgpa', e.target.value)}
                  disabled={!editing}
                  type="number"
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  placeholder="e.g., 8.5"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year of Completion"
                  value={profileData.studentDetails.yearOfCompletion}
                  onChange={(e) => handleInputChange('studentDetails.yearOfCompletion', e.target.value)}
                  disabled={!editing}
                  type="number"
                  inputProps={{ min: 2020, max: 2030 }}
                />
              </Grid>
            </Grid>

            {!user?.studentDetails?.isVerified && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Account Verification Required:</strong> Please contact your TnP officer to get verified. 
                  You need to be verified to apply for jobs.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Address Information */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Address Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              value={profileData.studentDetails.address.street}
              onChange={(e) => handleInputChange('studentDetails.address.street', e.target.value)}
              disabled={!editing}
              placeholder="Enter your street address"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              value={profileData.studentDetails.address.city}
              onChange={(e) => handleInputChange('studentDetails.address.city', e.target.value)}
              disabled={!editing}
              placeholder="Enter your city"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State"
              value={profileData.studentDetails.address.state}
              onChange={(e) => handleInputChange('studentDetails.address.state', e.target.value)}
              disabled={!editing}
              placeholder="Enter your state"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Pincode"
              value={profileData.studentDetails.address.pincode}
              onChange={(e) => handleInputChange('studentDetails.address.pincode', e.target.value)}
              disabled={!editing}
              placeholder="Enter your pincode"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Educational Marks */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Educational Marks
        </Typography>
        <Grid container spacing={3}>
          {/* 10th Marks */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              10th Standard Marks
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Percentage"
                  value={profileData.studentDetails.tenthMarks.percentage}
                  onChange={(e) => handleInputChange('studentDetails.tenthMarks.percentage', e.target.value)}
                  disabled={!editing}
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  placeholder="e.g., 85.5"
                />
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    disabled={!editing}
                    startIcon={<Upload />}
                  >
                    Upload Marksheet
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleTenthMarksheetUpload}
                    />
                  </Button>
                  {profileData.studentDetails.tenthMarks.marksheet && (
                    <Chip
                      label="Uploaded"
                      color="success"
                      size="small"
                      onDelete={editing ? () => handleInputChange('studentDetails.tenthMarks.marksheet', '') : undefined}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* 12th Marks */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              12th Standard Marks
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Percentage"
                  value={profileData.studentDetails.twelfthMarks.percentage}
                  onChange={(e) => handleInputChange('studentDetails.twelfthMarks.percentage', e.target.value)}
                  disabled={!editing}
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  placeholder="e.g., 88.2"
                />
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    disabled={!editing}
                    startIcon={<Upload />}
                  >
                    Upload Marksheet
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleTwelfthMarksheetUpload}
                    />
                  </Button>
                  {profileData.studentDetails.twelfthMarks.marksheet && (
                    <Chip
                      label="Uploaded"
                      color="success"
                      size="small"
                      onDelete={editing ? () => handleInputChange('studentDetails.twelfthMarks.marksheet', '') : undefined}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Last Semester Marksheet */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Last Semester Marksheet
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                component="label"
                variant="outlined"
                disabled={!editing}
                startIcon={<Upload />}
              >
                Upload Last Semester Marksheet
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleLastSemesterMarksheetUpload}
                />
              </Button>
              {profileData.studentDetails.lastSemesterMarksheet && (
                <Chip
                  label="Uploaded"
                  color="success"
                  onDelete={editing ? () => handleInputChange('studentDetails.lastSemesterMarksheet', '') : undefined}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Area of Interest */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Area of Interest
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
                Select Areas of Interest
              </Typography>
              <TextField
                fullWidth
                value=""
                placeholder="Click to select areas of interest"
                onClick={handleAreaOfInterestClick}
                disabled={!editing}
                InputProps={{
                  readOnly: true,
                  endAdornment: <KeyboardArrowDown />,
                  sx: {
                    cursor: editing ? 'pointer' : 'default',
                    '&:hover': editing ? {
                      backgroundColor: 'action.hover',
                    } : {},
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
                {profileData.studentDetails.areaOfInterest.map((value) => (
                  <Chip 
                    key={value} 
                    label={value} 
                    size="small" 
                    color="primary"
                    onDelete={editing ? () => {
                      const newAreas = profileData.studentDetails.areaOfInterest.filter(area => area !== value);
                      setProfileData(prev => ({
                        ...prev,
                        studentDetails: {
                          ...prev.studentDetails,
                          areaOfInterest: newAreas,
                        },
                      }));
                    } : undefined}
                  />
                ))}
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Select one or more areas that interest you. This helps recruiters understand your career preferences.
            </Typography>
          </Grid>
        </Grid>

        {/* Custom Popover for Area of Interest Selection */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleAreaOfInterestClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              width: anchorEl ? anchorEl.offsetWidth : 'auto',
              maxHeight: 300,
              mt: 1,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Areas of Interest
            </Typography>
            <List dense>
              {AREAS_OF_INTEREST.map((area) => (
                <ListItem key={area} disablePadding>
                  <ListItemButton
                    onClick={() => handleAreaOfInterestToggle(area)}
                    sx={{
                      backgroundColor: tempAreaOfInterest.includes(area) 
                        ? 'primary.main' 
                        : 'transparent',
                      color: tempAreaOfInterest.includes(area) 
                        ? 'white' 
                        : 'text.primary',
                      '&:hover': {
                        backgroundColor: tempAreaOfInterest.includes(area) 
                          ? 'primary.dark' 
                          : 'action.hover',
                      },
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <Checkbox
                      checked={tempAreaOfInterest.includes(area)}
                      sx={{
                        color: tempAreaOfInterest.includes(area) ? 'white' : 'text.primary',
                        '&.Mui-checked': {
                          color: 'white',
                        },
                      }}
                    />
                    <ListItemText 
                      primary={area}
                      sx={{
                        fontWeight: tempAreaOfInterest.includes(area) ? 'bold' : 'normal',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                variant="outlined"
                onClick={handleAreaOfInterestClose}
                size="small"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAreaOfInterestSelect}
                size="small"
                startIcon={<Check />}
              >
                Select
              </Button>
            </Box>
          </Box>
        </Popover>
      </Paper>

      {/* Activity Log */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Last login:</strong> {(user as any)?.lastLogin ? new Date((user as any).lastLogin).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Account status:</strong> {user?.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Role:</strong> {user?.role}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
