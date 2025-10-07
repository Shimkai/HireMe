import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Pagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Work,
} from '@mui/icons-material';
import JobCard from '../../components/cards/JobCard';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

interface Job {
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
}

interface Filters {
  search: string;
  location: string;
  jobType: string;
  minCTC: string;
  maxCTC: string;
  minCGPA: string;
  skills: string[];
}

const JobListing: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    jobType: '',
    minCTC: '',
    maxCTC: '',
    minCGPA: '',
    skills: [],
  });

  const jobTypes = ['Full-time', 'Internship', 'Part-time'];
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'Student') {
      fetchAppliedJobs();
    }
  }, [page, filters, user?.role]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      params.append('status', 'Approved');
      
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.minCTC) params.append('minCTC', filters.minCTC);
      if (filters.maxCTC) params.append('maxCTC', filters.maxCTC);
      if (filters.minCGPA) params.append('minCGPA', filters.minCGPA);

      const response = await jobService.getAllJobs({
        page: page.toString(),
        limit: '12',
        status: 'Approved',
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.jobType && { jobType: filters.jobType }),
        ...(filters.minCTC && { minCTC: filters.minCTC }),
        ...(filters.maxCTC && { maxCTC: filters.maxCTC }),
        ...(filters.minCGPA && { minCGPA: filters.minCGPA }),
      });
      setJobs(response.data as Job[]);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalJobs(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await applicationService.getMyApplications({ limit: 1000 });
      const appliedIds = response.data.map((app: any) => app.jobId._id || app.jobId);
      setAppliedJobIds(appliedIds);
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
      setAppliedJobIds([]);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      minCTC: '',
      maxCTC: '',
      minCGPA: '',
      skills: [],
    });
    setPage(1);
  };

  const handleApply = (jobId: string) => {
    // Navigate to job details page for application
    window.location.href = `/student/jobs/${jobId}`;
  };

  const handleViewDetails = (jobId: string) => {
    window.location.href = `/student/jobs/${jobId}`;
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Work sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Available Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ({totalJobs} jobs found)
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            fullWidth
            placeholder="Search jobs by title, company, or skills..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 120 }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="text"
              startIcon={<Clear />}
              onClick={clearFilters}
              color="secondary"
            >
              Clear All
            </Button>
          )}
        </Box>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min CTC (LPA)"
                type="number"
                value={filters.minCTC}
                onChange={(e) => handleFilterChange('minCTC', e.target.value)}
                placeholder="e.g., 5"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max CTC (LPA)"
                type="number"
                value={filters.maxCTC}
                onChange={(e) => handleFilterChange('maxCTC', e.target.value)}
                placeholder="e.g., 15"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min CGPA"
                type="number"
                value={filters.minCGPA}
                onChange={(e) => handleFilterChange('minCGPA', e.target.value)}
                placeholder="e.g., 7.0"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Jobs Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : jobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job._id}>
                <JobCard
                  job={job}
                  onApply={handleApply}
                  onViewDetails={handleViewDetails}
                  userRole={user?.role}
                  canApply={user?.role === 'Student' && 
                           user?.studentDetails?.isVerified && 
                           (!job.eligibility.minCGPA || 
                            !user?.studentDetails?.cgpa || 
                            user.studentDetails.cgpa >= job.eligibility.minCGPA)}
                  hasApplied={appliedJobIds.includes(job._id)}
                  cgpaEligible={!job.eligibility.minCGPA || 
                              !user?.studentDetails?.cgpa || 
                              user.studentDetails.cgpa >= job.eligibility.minCGPA}
                  userCgpa={user?.studentDetails?.cgpa}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default JobListing;
