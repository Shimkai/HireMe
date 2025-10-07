import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import {
  Assessment,
  Download,
  TrendingUp,
  People,
  Work,
  CheckCircle,
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    placedStudents: 0,
    totalJobs: 0,
    approvedJobs: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    placementRate: 0,
    courseWiseStats: [] as any[],
    companyWiseStats: [] as any[],
  });
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students
      const studentsResponse = await userService.getStudents({ limit: 100 });
      const students = studentsResponse.data;

      // Fetch jobs
      const jobsResponse = await jobService.getAllJobs({ limit: 100 });
      const jobs = jobsResponse.data;

      // Calculate basic stats
      const totalStudents = students.length;
      const verifiedStudents = students.filter(s => s.studentDetails?.isVerified).length;
      const placedStudents = students.filter(s => s.studentDetails?.placementStatus === 'Placed').length;
      const totalJobs = jobs.length;
      const approvedJobs = jobs.filter(j => j.status === 'Approved').length;

      // Calculate applications
      let totalApplications = 0;
      let acceptedApplications = 0;
      for (const job of jobs) {
        try {
          const applicationsResponse = await applicationService.getJobApplications(job._id);
          const applications = applicationsResponse.data;
          totalApplications += applications.length;
          acceptedApplications += applications.filter(app => app.status === 'Accepted').length;
        } catch (error) {
          console.error(`Failed to fetch applications for job ${job._id}:`, error);
        }
      }

      // Calculate placement rate
      const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

      // Course-wise statistics
      const courseStats = students.reduce((acc: any, student) => {
        const course = student.studentDetails?.courseName || 'Unknown';
        if (!acc[course]) {
          acc[course] = { total: 0, placed: 0, verified: 0 };
        }
        acc[course].total++;
        if (student.studentDetails?.placementStatus === 'Placed') {
          acc[course].placed++;
        }
        if (student.studentDetails?.isVerified) {
          acc[course].verified++;
        }
        return acc;
      }, {});

      const courseWiseStats = Object.entries(courseStats).map(([course, stats]: [string, any]) => ({
        course,
        total: stats.total,
        placed: stats.placed,
        verified: stats.verified,
        placementRate: Math.round((stats.placed / stats.total) * 100),
      }));

      // Company-wise statistics
      const companyStats = jobs.reduce((acc: any, job) => {
        const company = job.companyName;
        if (!acc[company]) {
          acc[company] = { jobs: 0, applications: 0 };
        }
        acc[company].jobs++;
        return acc;
      }, {});

      const companyWiseStats = Object.entries(companyStats).map(([company, stats]: [string, any]) => ({
        company,
        jobs: stats.jobs,
        applications: stats.applications,
      }));

      setReportData({
        totalStudents,
        verifiedStudents,
        placedStudents,
        totalJobs,
        approvedJobs,
        totalApplications,
        acceptedApplications,
        placementRate,
        courseWiseStats,
        companyWiseStats,
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      reportType,
      dateRange: { startDate, endDate },
      data: reportData,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placement-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Students', reportData.totalStudents],
      ['Verified Students', reportData.verifiedStudents],
      ['Placed Students', reportData.placedStudents],
      ['Placement Rate (%)', reportData.placementRate],
      ['Total Jobs', reportData.totalJobs],
      ['Approved Jobs', reportData.approvedJobs],
      ['Total Applications', reportData.totalApplications],
      ['Accepted Applications', reportData.acceptedApplications],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placement-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Assessment sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Placement Reports
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          onClick={() => window.location.href = '/tnp/dashboard'}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Configuration
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="overview">Overview Report</MenuItem>
                <MenuItem value="detailed">Detailed Report</MenuItem>
                <MenuItem value="coursewise">Course-wise Report</MenuItem>
                <MenuItem value="companywise">Company-wise Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={generateReport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button
                variant="outlined"
                onClick={exportReport}
                startIcon={<Download />}
                disabled={loading}
              >
                Export JSON
              </Button>
              <Button
                variant="outlined"
                onClick={exportCSV}
                startIcon={<Download />}
                disabled={loading}
              >
                Export CSV
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Overview Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="primary" />
                <Box>
                  <Typography variant="h4" color="primary">
                    {reportData.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="h4" color="success">
                    {reportData.placedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="info" />
                <Box>
                  <Typography variant="h4" color="info">
                    {reportData.placementRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placement Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Work color="warning" />
                <Box>
                  <Typography variant="h4" color="warning">
                    {reportData.totalJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Jobs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Students
                </Typography>
                <Typography variant="h6">
                  {reportData.totalStudents}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Verified Students
                </Typography>
                <Typography variant="h6">
                  {reportData.verifiedStudents}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Placed Students
                </Typography>
                <Typography variant="h6">
                  {reportData.placedStudents}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Placement Rate
                </Typography>
                <Typography variant="h6">
                  {reportData.placementRate}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Job Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Jobs
                </Typography>
                <Typography variant="h6">
                  {reportData.totalJobs}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Approved Jobs
                </Typography>
                <Typography variant="h6">
                  {reportData.approvedJobs}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
                <Typography variant="h6">
                  {reportData.totalApplications}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Accepted Applications
                </Typography>
                <Typography variant="h6">
                  {reportData.acceptedApplications}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Course-wise Statistics */}
        {reportData.courseWiseStats.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Course-wise Statistics
              </Typography>
              <Grid container spacing={2}>
                {reportData.courseWiseStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {stat.course}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total: {stat.total} | Placed: {stat.placed} | Verified: {stat.verified}
                        </Typography>
                        <Chip
                          label={`${stat.placementRate}% placed`}
                          color={stat.placementRate > 50 ? 'success' : stat.placementRate > 25 ? 'warning' : 'error'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Company-wise Statistics */}
        {reportData.companyWiseStats.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company-wise Statistics
              </Typography>
              <Grid container spacing={2}>
                {reportData.companyWiseStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {stat.company}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Jobs Posted: {stat.jobs}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Reports;
