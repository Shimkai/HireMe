import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
<<<<<<< HEAD
import Dashboard from './pages/student/Dashboard';
import JobListing from './pages/student/JobListing';
import JobDetails from './pages/student/JobDetails';
import MyApplications from './pages/student/MyApplications';
import ResumeBuilder from './pages/student/ResumeBuilder';
import Profile from './pages/student/Profile';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import ManageApplicants from './pages/recruiter/ManageApplicants';
import RecruiterProfile from './pages/recruiter/Profile';
import TnPDashboard from './pages/tnp/Dashboard';
import ManageStudents from './pages/tnp/ManageStudents';
import ApproveJobs from './pages/tnp/ApproveJobs';
import ViewApplicants from './pages/tnp/ViewApplicants';
import Reports from './pages/tnp/Reports';
import TnPProfile from './pages/tnp/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Unauthorized from './pages/Unauthorized';
=======
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { Typography, Box, Button } from '@mui/material';
import { useAuth } from './hooks/useAuth';

// Import proper functional page components
// TnP Pages
import StudentsPage from './pages/tnp/StudentsPage';
import PendingJobsPage from './pages/tnp/PendingJobsPage';
import AnalyticsPage from './pages/tnp/AnalyticsPage';
import ReportPage from './pages/tnp/ReportPage';

// Student Pages
import JobsPage from './pages/student/JobsPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import ResumePage from './pages/student/ResumePage';

// Recruiter Pages
import PostJobPage from './pages/recruiter/PostJobPage';
import RecruiterApplicantsPage from './pages/recruiter/ApplicantsPage';
import ManageJobsPage from './pages/recruiter/ManageJobsPage';

// Profile Page
import ProfilePage from './pages/ProfilePage';

// Role-based Jobs Component
const RoleBasedJobsPage = () => {
  const { user } = useAuth();
  
  if (user?.role === 'Student') {
    return <JobsPage />;
  } else if (user?.role === 'Recruiter') {
    return <ManageJobsPage />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};
>>>>>>> 9b124f5 (report and student recommendation)

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
<<<<<<< HEAD
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Student Routes */}
=======
            
            {/* Protected Routes */}
>>>>>>> 9b124f5 (report and student recommendation)
            <Route
              path="/student/dashboard"
              element={
<<<<<<< HEAD
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/jobs"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout>
                    <JobListing />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/jobs/:id"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout>
                    <JobDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout>
                    <MyApplications />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/resume"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout>
                    <ResumeBuilder />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Recruiter Routes */}
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <MainLayout>
                    <RecruiterDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/post-job"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <MainLayout>
                    <PostJob />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <MainLayout>
                    <ManageJobs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/applicants"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <MainLayout>
                    <ManageApplicants />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/profile"
              element={
                <ProtectedRoute allowedRoles={['Recruiter']}>
                  <MainLayout>
                    <RecruiterProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* TnP Routes */}
            <Route
              path="/tnp/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TnP']}>
                  <MainLayout>
                    <TnPDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/students"
              element={
                <ProtectedRoute allowedRoles={['TnP']}>
                  <MainLayout>
                    <ManageStudents />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/jobs/pending"
              element={
                <ProtectedRoute allowedRoles={['TnP']}>
                  <MainLayout>
                    <ApproveJobs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/applicants"
              element={
                <ProtectedRoute allowedRoles={['TnP']}>
                  <MainLayout>
                    <ViewApplicants />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/reports"
              element={
                <ProtectedRoute allowedRoles={['TnP']}>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tnp/profile"
              element={
                <ProtectedRoute allowedRoles={['TnP']}>
                  <MainLayout>
                    <TnPProfile />
                  </MainLayout>
=======
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Profile Route - Available for all roles */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
>>>>>>> 9b124f5 (report and student recommendation)
                </ProtectedRoute>
              }
            />
            
<<<<<<< HEAD
            {/* Default redirects */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
=======
            {/* Role-based Jobs Route */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <RoleBasedJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumePage />
                </ProtectedRoute>
              }
            />
            
            {/* Recruiter Routes */}
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute>
                  <PostJobPage />
                </ProtectedRoute>
              }
            />
                <Route
                  path="/applicants"
                  element={
                    <ProtectedRoute>
                      <RecruiterApplicantsPage />
                    </ProtectedRoute>
                  }
                />
            
            {/* TnP Routes */}
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/pending"
              element={
                <ProtectedRoute>
                  <PendingJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />
            
            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/unauthorized" element={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Typography variant="h4" gutterBottom>Unauthorized Access</Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  You don't have permission to access this page.
                </Typography>
                <Button variant="contained" onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
              </Box>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
>>>>>>> 9b124f5 (report and student recommendation)
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;