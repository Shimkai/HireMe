import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface JobRecommendation {
  job_id: string;
  role: string;
  company: string;
  category: string;
  probability: number;
  match_score: number;
  required_skills: string[];
  min_cgpa: number;
  min_x10: number;
  min_x12: number;
  reason: string;
  skill_overlap: number;
  cgpa_above_threshold: boolean;
  interest_match: boolean;
}

interface JobCardProps {
  job: JobRecommendation;
  onApply: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails }) => {
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        borderLeft: '4px solid',
        borderColor: getMatchColor(job.match_score) + '.main',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {job.role}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BusinessIcon fontSize="small" />
              {job.company}
            </Typography>
          </Box>
          <Chip
            label={job.match_score.toFixed(0) + '%'}
            color={getMatchColor(job.match_score)}
            size="small"
            icon={<TrendingUpIcon />}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Match Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Match Score
          </Typography>
          <LinearProgress
            variant="determinate"
            value={job.match_score}
            color={getMatchColor(job.match_score)}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Match Indicators */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {job.interest_match && (
            <Chip
              label="Interest Match"
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
          {job.cgpa_above_threshold && (
            <Chip
              label="CGPA Met"
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
          <Chip
            label={`${(job.skill_overlap * 100).toFixed(0)}% Skill Overlap`}
            size="small"
            color="info"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        {/* Required Skills */}
        <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
          Required Skills:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {job.required_skills.slice(0, 5).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
          ))}
          {job.required_skills.length > 5 && (
            <Chip
              label={`+${job.required_skills.length - 5} more`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
          )}
        </Box>

        {/* Eligibility Criteria */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, fontSize: '0.8rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SchoolIcon fontSize="small" />
            <Typography variant="caption">
              CGPA: {job.min_cgpa}+
            </Typography>
          </Box>
        </Box>

        {/* Reason for Recommendation */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
            Why you're a good fit:
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {job.reason}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => onApply(job.job_id)}
            sx={{ flex: 1 }}
            fullWidth
          >
            Apply Now
          </Button>
          <IconButton
            color="primary"
            onClick={() => onViewDetails(job.job_id)}
            title="View full details"
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;

