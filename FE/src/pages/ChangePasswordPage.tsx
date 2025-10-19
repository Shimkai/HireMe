import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await userService.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
      
      // Show success message and then logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/settings');
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <LockIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Password Changed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been updated. You will be logged out and redirected to the login page.
            </Typography>
            <CircularProgress size={24} />
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Settings
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Change Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your current password and choose a new password
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Current Password */}
            <TextField
              {...register('currentPassword')}
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* New Password */}
            <TextField
              {...register('newPassword')}
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password */}
            <TextField
              {...register('confirmPassword')}
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePasswordPage;
