import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/cards/StatCard';
import {
  People,
  Work,
  CheckCircle,
  TrendingUp,
  School,
  Assignment,
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    unverifiedStudents: 0,
    placedStudents: 0,
    shortlistedStudents: 0,
    totalJobs: 0,
    pendingJobs: 0,
    approvedJobs: 0,
    rejectedJobs: 0,
    totalApplications: 0,
    placementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching TnP dashboard data...');
      
      // Fetch students from the same college
      console.log('Fetching students...');
      const studentsResponse = await userService.getStudents({ limit: 100 });
      console.log('Students response:', studentsResponse);
      const students = studentsResponse.data || [];
      
      // Calculate student stats
      const totalStudents = students.length;
      const verifiedStudents = students.filter(student => student.studentDetails?.isVerified).length;
      const unverifiedStudents = totalStudents - verifiedStudents;
      
      // Calculate shortlisted and placed students based on application statuses
      let shortlistedStudents = 0;
      let placedStudents = 0;
      
      try {
        // Get all applications to analyze student statuses
        const applicationsResponse = await applicationService.getAllApplications({ limit: 1000 });
        const applications = applicationsResponse.data || [];
        
        // Get unique student IDs who have been shortlisted or offered
        const shortlistedStudentIds = new Set();
        const placedStudentIds = new Set();
        
        applications.forEach(app => {
          if (app.studentId && app.status === 'Shortlisted') {
            shortlistedStudentIds.add(app.studentId._id || app.studentId);
          }
          if (app.studentId && (app.status === 'Offered' || app.status === 'Accepted')) {
            placedStudentIds.add(app.studentId._id || app.studentId);
          }
        });
        
        shortlistedStudents = shortlistedStudentIds.size;
        placedStudents = placedStudentIds.size;
      } catch (error) {
        console.error('Failed to fetch applications for student status:', error);
        // Fallback to old method
        placedStudents = students.filter(student => student.studentDetails?.placementStatus === 'Placed').length;
      }
      
      // Fetch all jobs
      console.log('Fetching jobs...');
      const jobsResponse = await jobService.getAllJobs({ limit: 100 });
      console.log('Jobs response:', jobsResponse);
      const jobs = jobsResponse.data || [];
      
      // Calculate job stats
      const totalJobs = jobs.length;
      const pendingJobs = jobs.filter(job => job.status === 'Pending').length;
      const approvedJobs = jobs.filter(job => job.status === 'Approved').length;
      const rejectedJobs = jobs.filter(job => job.status === 'Rejected').length;
      
      // Calculate placement rate
      const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
      
      // Calculate total applications by summing up application counts from all jobs
      let totalApplications = 0;
      try {
        // Sum up application counts from all jobs
        totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);
      } catch (error) {
        console.error('Failed to calculate applications:', error);
        totalApplications = 0;
      }
      
      console.log('Setting stats:', {
        totalStudents,
        verifiedStudents,
        unverifiedStudents,
        placedStudents,
        shortlistedStudents,
        totalJobs,
        pendingJobs,
        approvedJobs,
        rejectedJobs,
        totalApplications,
        placementRate,
      });
      
      setStats({
        totalStudents,
        verifiedStudents,
        unverifiedStudents,
        placedStudents,
        shortlistedStudents,
        totalJobs,
        pendingJobs,
        approvedJobs,
        rejectedJobs,
        totalApplications,
        placementRate,
      });
      
      setRecentStudents(students.slice(0, 3));
      setPendingJobs(jobs.filter(job => job.status === 'Pending').slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default stats to prevent blank page
      setStats({
        totalStudents: 0,
        verifiedStudents: 0,
        unverifiedStudents: 0,
        placedStudents: 0,
        totalJobs: 0,
        pendingJobs: 0,
        approvedJobs: 0,
        rejectedJobs: 0,
        totalApplications: 0,
        placementRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading Dashboard...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we fetch your data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's your college placement activity overview
      </Typography>

      <Grid container spacing={3}>
        {/* Student Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People />}
            color="primary"
            subtitle="Registered students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Students"
            value={stats.verifiedStudents}
            icon={<CheckCircle />}
            color="success"
            subtitle="Can apply for jobs"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unverified Students"
            value={stats.unverifiedStudents}
            icon={<School />}
            color="warning"
            subtitle="Need verification"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shortlisted Students"
            value={stats.shortlistedStudents}
            icon={<Assignment />}
            color="info"
            subtitle="In recruitment process"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Placed Students"
            value={stats.placedStudents}
            icon={<TrendingUp />}
            color="success"
            subtitle={`${stats.placementRate}% placement rate`}
          />
        </Grid>

        {/* Job Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={<Work />}
            color="info"
            subtitle="All job postings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Jobs"
            value={stats.pendingJobs}
            icon={<Assignment />}
            color="warning"
            subtitle="Awaiting approval"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Jobs"
            value={stats.approvedJobs}
            icon={<CheckCircle />}
            color="success"
            subtitle="Live for students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={<Assignment />}
            color="primary"
            subtitle="Student applications"
          />
        </Grid>

        {/* Recent Students */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Students
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading student data...
              </Typography>
            ) : recentStudents.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No students registered yet.
                </Typography>
              </Box>
            ) : (
              <Box>
                {recentStudents.map((student) => (
                  <Box key={student._id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {student.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {student.email} • {student.studentDetails?.courseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Registered: {new Date(student.createdAt).toLocaleDateString()} • 
                      Status: {student.studentDetails?.isVerified ? 'Verified' : 'Unverified'} • 
                      Placement: {student.studentDetails?.placementStatus || 'Not Placed'}
                    </Typography>
                  </Box>
                ))}
                {recentStudents.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => window.location.href = '/tnp/students'}
                    sx={{ mt: 1 }}
                  >
                    View All Students ({stats.totalStudents})
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Pending Jobs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Jobs Pending Approval
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading job data...
              </Typography>
            ) : pendingJobs.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No jobs pending approval.
                </Typography>
              </Box>
            ) : (
              <Box>
                {pendingJobs.map((job) => (
                  <Box key={job._id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {job.companyName} • {job.location} • {job.jobType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Posted: {new Date(job.createdAt).toLocaleDateString()} • 
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
                {pendingJobs.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => window.location.href = '/tnp/jobs/pending'}
                    sx={{ mt: 1 }}
                  >
                    View All Pending Jobs ({stats.pendingJobs})
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/tnp/students'}
                >
                  Manage Students
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/tnp/jobs/pending'}
                >
                  Approve Jobs
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.href = '/tnp/applications'}
                >
                  View Applications
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.href = '/tnp/reports'}
                >
                  Generate Reports
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.href = '/tnp/profile'}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* College Information */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          College Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>College:</strong> {typeof user?.tnpDetails?.college === 'object' && user?.tnpDetails?.college ? user.tnpDetails.college.name : user?.tnpDetails?.college || 'Not specified'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Designation:</strong> {user?.tnpDetails?.designation}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Employee ID:</strong> {user?.tnpDetails?.employeeId || 'Not assigned'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Account Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
