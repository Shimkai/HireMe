import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Stack,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Business,
  AttachMoney,
} from '@mui/icons-material';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    jobType: string;
    ctc: {
      min: number;
      max: number;
      currency: string;
    };
    applicationDeadline: string;
    skillsRequired: string[];
    eligibility: {
      minCGPA?: number;
      allowedCourses: string[];
    };
    status: string;
    applicationCount: number;
  };
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  userRole?: string;
  canApply?: boolean;
  hasApplied?: boolean;
  cgpaEligible?: boolean;
  userCgpa?: number;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onViewDetails,
  userRole,
  canApply = true,
  hasApplied = false,
  cgpaEligible = true,
  userCgpa,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const isDeadlinePassed = new Date(job.applicationDeadline) < new Date();
  const isEligible = cgpaEligible !== false;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Company Logo and Basic Info */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
            }}
          >
            {job.companyName.charAt(0)}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" component="h3" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.companyName}
            </Typography>
          </Box>
          <Chip
            label={job.status}
            color={getStatusColor(job.status) as any}
            size="small"
          />
        </Box>

        {/* Key Details Only */}
        <Stack spacing={1} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2">{job.location}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2">{job.jobType}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <AttachMoney fontSize="small" color="action" />
            <Typography variant="body2">
              {formatCurrency(job.ctc.min)} - {formatCurrency(job.ctc.max)}
            </Typography>
          </Box>
        </Stack>

        {/* Skills Preview - Only show first 3 */}
        {job.skillsRequired.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Skills:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
              {job.skillsRequired.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                />
              ))}
              {job.skillsRequired.length > 3 && (
                <Chip
                  label={`+${job.skillsRequired.length - 3} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Recruiter specific info */}
        {userRole === 'Recruiter' && (
          <Typography variant="body2" color="text.secondary">
            {job.applicationCount} applications received
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          onClick={() => onViewDetails?.(job._id)}
          fullWidth
          sx={{ mr: 1 }}
        >
          View Details
        </Button>
        {userRole === 'Student' && !isDeadlinePassed && (
          <>
            {hasApplied ? (
              <Button
                variant="outlined"
                disabled
                fullWidth
                color="secondary"
              >
                Already Applied
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => onApply?.(job._id)}
                disabled={!canApply || job.status !== 'Approved' || !isEligible}
                fullWidth
                color="primary"
              >
                {!isEligible ? 'Not Eligible' : 'Apply Now'}
              </Button>
            )}
            {!isEligible && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                CGPA {userCgpa || 'Not specified'} below required {job.eligibility.minCGPA}
              </Alert>
            )}
            {isEligible && job.status !== 'Approved' && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Job not approved yet
              </Alert>
            )}
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default JobCard;
