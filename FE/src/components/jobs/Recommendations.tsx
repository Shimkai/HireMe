import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Work as WorkIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import JobCard from './JobCard';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import axios from 'axios';

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

// Vite uses import.meta.env
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

const Recommendations: React.FC<{ limit?: number }> = ({ limit = 6 }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Helper function to calculate match score
  const calculateMatchScore = (studentData: any, job: any): {
    match_score: number;
    skill_overlap: number;
    cgpa_above_threshold: boolean;
    interest_match: boolean;
    reason: string;
  } => {
    const studentSkills = new Set((studentData.skills || []).map((s: string) => s.toLowerCase()));
    const jobSkills = new Set((job.skillsRequired || []).map((s: string) => s.toLowerCase()));
    
    // Calculate skill overlap
    const commonSkills = [...studentSkills].filter(skill => jobSkills.has(skill));
    const skill_overlap = jobSkills.size > 0 ? commonSkills.length / jobSkills.size : 0;
    
    // Check CGPA requirement
    const cgpa_above_threshold = studentData.cgpa >= (job.eligibility?.minCGPA || 7.0);
    const cgpa_diff = studentData.cgpa - (job.eligibility?.minCGPA || 7.0);
    
    // Check interest match
    const studentInterest = (studentData.interest || '').toLowerCase();
    const jobCategory = (job.category || '').toLowerCase();
    const interest_match = studentInterest === jobCategory || 
                          studentInterest.includes(jobCategory) || 
                          jobCategory.includes(studentInterest);
    
    // Calculate individual scores
    const skill_score = skill_overlap * 40; // 40% weight for skills
    const cgpa_score = cgpa_above_threshold ? 
      Math.min(30, 20 + cgpa_diff * 5) : // Bonus for exceeding CGPA requirement
      0;
    const interest_score = interest_match ? 20 : 0; // 20% weight for interest match
    const threshold_bonus = cgpa_above_threshold ? 10 : 0; // 10% bonus for meeting minimum
    
    const match_score = Math.min(100, Math.round(skill_score + cgpa_score + interest_score + threshold_bonus));
    
    // Generate reason
    const reasons = [];
    if (skill_overlap > 0.5) reasons.push(`${Math.round(skill_overlap * 100)}% skill match`);
    if (interest_match) reasons.push('matches your interest');
    if (cgpa_above_threshold) reasons.push('CGPA requirement met');
    
    const reason = reasons.length > 0 ? reasons.join(' + ') : 'Available position';
    
    return {
      match_score,
      skill_overlap,
      cgpa_above_threshold,
      interest_match,
      reason
    };
  };
  
  useEffect(() => {
    fetchRecommendations();
    fetchAppliedJobs();
  }, [user]);

  const fetchAppliedJobs = async () => {
    if (!user) return;
    
    try {
      const response = await applicationService.getMyApplications();
      const appliedIds = new Set(response.data.map((app: any) => app.jobId?._id || app.jobId));
      setAppliedJobIds(appliedIds);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    // Prepare student profile (needed for both ML API and fallback)
    const studentProfile = {
      cgpa: user.studentDetails?.cgpa || 8.0,
      x10: user.studentDetails?.cgpa ? user.studentDetails.tenthMarks?.percentage : 85,
      x12: user.studentDetails?.cgpa ? user.studentDetails.twelfthMarks?.percentage : 82,
      skills: user.studentDetails?.skills || [],
      interest: user.studentDetails?.areaOfInterest?.[0] || 'Full Stack',
    };
    
    try {
      // 1. Get all jobs from backend
      const jobsResponse = await jobService.getAllJobs({ status: 'Approved' });
      const allJobs = jobsResponse.data;
      
      if (allJobs.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      // 3. Transform jobs to match ML API format
      const jobsForML = allJobs.map(job => ({
        job_id: job._id,
        company: job.companyName,
        role_title: job.title,
        category: job.category || 'Full Stack',
        required_skills: job.skillsRequired || [],
        min_cgpa: job.eligibility?.minCGPA || 7.0,
        min_x10: job.eligibility?.minTenthPercentage || 70,
        min_x12: job.eligibility?.minTwelfthPercentage || 70,
      }));
      
      // 4. Try to call ML API for predictions (with timeout)
      try {
        const mlRequest = {
          student: {
            ...studentProfile,
            top_k: limit * 2, // Get more to filter out applied jobs
          },
          jobs: jobsForML,
        };
        
        // Check if ML API is available with a quick health check
        const healthCheck = await Promise.race([
          axios.get(`${ML_API_URL}/health`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
        ]);
        
        // If health check passes, call ML API
        const mlResponse = await axios.post(`${ML_API_URL}/predict`, mlRequest);
        let recommendedJobs = mlResponse.data;
        
        // 5. Filter out already applied jobs (if you have this data)
        // TODO: Check against applications
        
        // 6. Limit results
        recommendedJobs = recommendedJobs.slice(0, limit);
        
        setRecommendations(recommendedJobs);
        setLoading(false);
        return;
      } catch (mlError) {
        // ML API not available - silently continue to fallback
        console.log('ML API not available, using rule-based matching instead');
        throw new Error('ML_API_UNAVAILABLE'); // Trigger fallback
      }
      
    } catch (err: any) {
      // ML API not available - silently fallback to regular jobs
      if (err.message !== 'ML_API_UNAVAILABLE') {
        console.error('Error fetching recommendations:', err);
      }
      
      // Fallback: show regular jobs if ML API fails
      try {
        const jobsResponse = await jobService.getAllJobs({ status: 'Approved' });
        const allJobs = jobsResponse.data;
        
        // Calculate match score for each job and sort by score
        const jobsWithScores = allJobs.map((job: any) => {
          const matchData = calculateMatchScore(studentProfile, job);
          return {
            job_id: job._id,
            role: job.title,
            company: job.companyName,
            category: job.category || 'Full Stack',
            probability: matchData.match_score / 100,
            match_score: matchData.match_score,
            required_skills: job.skillsRequired || [],
            min_cgpa: job.eligibility?.minCGPA || 7.0,
            min_x10: job.eligibility?.minTenthPercentage || 70,
            min_x12: job.eligibility?.minTwelfthPercentage || 70,
            reason: matchData.reason,
            skill_overlap: matchData.skill_overlap,
            cgpa_above_threshold: matchData.cgpa_above_threshold,
            interest_match: matchData.interest_match,
            score: matchData.match_score, // For sorting
          };
        });
        
        // Sort by match score (highest first) and take top K
        const fallbackRecs = jobsWithScores
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, limit)
          .map(({ score, ...rest }) => rest); // Remove score field before setting
        
        setRecommendations(fallbackRecs);
        setError(''); // Clear error since we have a fallback
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        setError('Unable to load jobs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId: string) => {
    // Navigate to jobs page or open apply dialog
    window.location.href = `/jobs?apply=${jobId}`;
  };

  const handleViewDetails = (jobId: string) => {
    // Open job details modal or navigate
    window.open(`/jobs/${jobId}`, '_blank');
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkIcon />
          Job Recommendations
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchRecommendations();
            fetchAppliedJobs();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No job recommendations available at the moment.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && recommendations.length > 0 && (
        <Grid container spacing={3}>
          {recommendations.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.job_id}>
              <JobCard
                job={job}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
                hasApplied={appliedJobIds.has(job.job_id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {recommendations.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Complete your profile to get personalized job recommendations!
        </Alert>
      )}
    </Box>
  );
};

export default Recommendations;

