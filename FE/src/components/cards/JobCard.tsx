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
  Schedule,
  AttachMoney,
  School,
} from '@mui/icons-material';
import { format } from 'date-fns';

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
          <Box display="flex" alignItems="center" gap={1}>
            <Schedule fontSize="small" color="action" />
            <Typography
              variant="body2"
              color={isDeadlinePassed ? 'error.main' : 'text.secondary'}
            >
              Deadline: {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
            </Typography>
          </Box>
          {job.eligibility.minCGPA && (
            <Box display="flex" alignItems="center" gap={1}>
              <School fontSize="small" color="action" />
              <Typography variant="body2">
                Min CGPA: {job.eligibility.minCGPA}
              </Typography>
            </Box>
          )}
        </Stack>

        {job.skillsRequired.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Skills Required:
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
            ) : canApply ? (
              <Button
                variant="contained"
                onClick={() => onApply?.(job._id)}
                disabled={job.status !== 'Approved'}
                fullWidth
                color="primary"
              >
                Apply Now
              </Button>
            ) : !cgpaEligible ? (
              <Alert severity="warning" sx={{ mb: 1 }}>
                CGPA {userCgpa || 'Not specified'} below required {job.eligibility.minCGPA}
              </Alert>
            ) : job.status !== 'Approved' ? (
              <Alert severity="info" sx={{ mb: 1 }}>
                Job not approved yet
              </Alert>
            ) : null}
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default JobCard;
