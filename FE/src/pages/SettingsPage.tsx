import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  Lock as LockIcon,
  Palette as PaletteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleChangeTheme = () => {
    toggleTheme();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Change Password Card */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" component="h2">
                Change Password
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update your password to keep your account secure. You'll need to enter your current password.
            </Typography>
          </CardContent>
          <Divider />
          <CardActions sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              startIcon={<LockIcon />}
            >
              Change Password
            </Button>
          </CardActions>
        </Card>

        {/* Change Theme Card */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PaletteIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" component="h2">
                Change Theme
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Switch between light and dark themes. Your preference will be saved automatically.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Current theme: <strong>{mode === 'light' ? 'Light' : 'Dark'}</strong>
              </Typography>
            </Box>
          </CardContent>
          <Divider />
          <CardActions sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={handleChangeTheme}
              startIcon={<PaletteIcon />}
            >
              Switch to {mode === 'light' ? 'Dark' : 'Light'} Theme
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
};

export default SettingsPage;
