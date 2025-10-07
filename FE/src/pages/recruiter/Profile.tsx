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
} from '@mui/material';
import {
  Person,
  Save,
  Edit,
  Upload,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../features/auth/authSlice';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    profileAvatar: user?.profileAvatar || '',
    recruiterDetails: {
      companyName: user?.recruiterDetails?.companyName || '',
      industry: user?.recruiterDetails?.industry || '',
      designation: user?.recruiterDetails?.designation || '',
      companyInfo: user?.recruiterDetails?.companyInfo || '',
      companyWebsite: user?.recruiterDetails?.companyWebsite || '',
    },
  });

  useEffect(() => {
    // Update profile data when user changes, but preserve current profileAvatar if it exists
    setProfileData(prev => ({
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      profileAvatar: user?.profileAvatar || prev.profileAvatar || '',
      recruiterDetails: {
        companyName: user?.recruiterDetails?.companyName || '',
        industry: user?.recruiterDetails?.industry || '',
        designation: user?.recruiterDetails?.designation || '',
        companyInfo: user?.recruiterDetails?.companyInfo || '',
        companyWebsite: user?.recruiterDetails?.companyWebsite || '',
      },
    }));
  }, [user]);

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Media & Entertainment',
    'Real Estate',
    'Automotive',
    'Telecommunications',
    'Energy',
    'Government',
    'Non-Profit',
    'Other',
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await userService.updateProfile(profileData as any);
      dispatch(updateUser(response.data));
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
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
        
        const response = await userService.uploadAvatar(file);
        // Update the user's profile avatar in Redux store
        const updatedUser = { ...user, profileAvatar: response.data.profileAvatar };
        dispatch(updateUser(updatedUser));
        
        // Update local profile data state
        setProfileData(prev => ({
          ...prev,
          profileAvatar: response.data.profileAvatar
        }));
        
        setSuccess('Profile photo updated successfully!');
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to upload photo');
      } finally {
        setSaving(false);
      }
    }
  };

  const getVerificationStatus = () => {
    // Recruiters are always verified - no verification needed
    return <Chip label="Verified" color="success" size="small" />;
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
                  recruiterDetails: {
                    companyName: user?.recruiterDetails?.companyName || '',
                    industry: user?.recruiterDetails?.industry || '',
                    designation: user?.recruiterDetails?.designation || '',
                    companyInfo: user?.recruiterDetails?.companyInfo || '',
                    companyWebsite: user?.recruiterDetails?.companyWebsite || '',
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
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="center" gap={1} mb={1}>
                {getVerificationStatus()}
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
              Company Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={profileData.recruiterDetails.companyName}
                  onChange={(e) => handleInputChange('recruiterDetails.companyName', e.target.value)}
                  disabled={!editing}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={profileData.recruiterDetails.industry}
                    onChange={(e) => handleInputChange('recruiterDetails.industry', e.target.value)}
                    label="Industry"
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Designation"
                  value={profileData.recruiterDetails.designation}
                  onChange={(e) => handleInputChange('recruiterDetails.designation', e.target.value)}
                  disabled={!editing}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Website"
                  value={profileData.recruiterDetails.companyWebsite}
                  onChange={(e) => handleInputChange('recruiterDetails.companyWebsite', e.target.value)}
                  disabled={!editing}
                  type="url"
                  placeholder="https://company.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Information"
                  value={profileData.recruiterDetails.companyInfo}
                  onChange={(e) => handleInputChange('recruiterDetails.companyInfo', e.target.value)}
                  disabled={!editing}
                  multiline
                  rows={4}
                  placeholder="Brief description of your company..."
                />
              </Grid>
            </Grid>

          </Paper>
        </Grid>
      </Grid>

      {/* Account Information */}
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
