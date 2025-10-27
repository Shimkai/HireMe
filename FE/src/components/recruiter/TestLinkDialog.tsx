import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Send, Link as LinkIcon } from '@mui/icons-material';

interface TestLinkDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicationCount: number;
  shortlistedCount: number;
  onSend: (testLink: string, target: 'all' | 'shortlisted') => Promise<void>;
}

const TestLinkDialog: React.FC<TestLinkDialogProps> = ({
  open,
  onClose,
  jobId,
  jobTitle,
  companyName,
  applicationCount,
  shortlistedCount,
  onSend,
}) => {
  const [testLink, setTestLink] = useState('');
  const [target, setTarget] = useState<'all' | 'shortlisted'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!testLink.trim()) {
      setError('Please enter a test link');
      return;
    }

    // Basic URL validation
    try {
      new URL(testLink);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com/test)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSend(testLink, target);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send test link');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTestLink('');
    setTarget('all');
    setError('');
    setSuccess(false);
    onClose();
  };

  const getTargetCount = () => {
    return target === 'all' ? applicationCount : shortlistedCount;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon color="primary" />
          Send Test Link
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Test link sent successfully to {getTargetCount()} {target === 'all' ? 'applicants' : 'shortlisted candidates'}!
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Job:</strong> {jobTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              <strong>Company:</strong> {companyName}
            </Typography>

            <TextField
              fullWidth
              label="Test Link URL"
              value={testLink}
              onChange={(e) => setTestLink(e.target.value)}
              placeholder="https://example.com/online-test"
              helperText="Enter the full URL of the test"
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Recipients</InputLabel>
              <Select
                value={target}
                onChange={(e) => setTarget(e.target.value as 'all' | 'shortlisted')}
                label="Target Recipients"
                disabled={loading}
              >
                <MenuItem value="all">
                  All Applicants ({applicationCount})
                </MenuItem>
                <MenuItem value="shortlisted">
                  Shortlisted Applicants ({shortlistedCount})
                </MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              This test link will be sent as a high-priority notification to the selected applicants.
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading && !success}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            onClick={handleSend}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            disabled={loading || !testLink.trim()}
          >
            {loading ? 'Sending...' : 'Send Test Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TestLinkDialog;
