import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { Typography, Box, Button } from '@mui/material';
import { useAuth } from './hooks/useAuth';

// TnP Pages
import StudentsPage from './pages/tnp/StudentsPage';
import PendingJobsPage from './pages/tnp/PendingJobsPage';
import ReportPage from './pages/tnp/ReportPage';

// Student Pages
import JobsPage from './pages/student/JobsPage';
import JobDetails from './pages/student/JobDetails';
import ApplicationsPage from './pages/student/ApplicationsPage';
import ResumePage from './pages/student/ResumePage';

// Recruiter Pages
import PostJobPage from './pages/recruiter/PostJobPage';
import RecruiterApplicantsPage from './pages/recruiter/ApplicantsPage';
import ManageJobsPage from './pages/recruiter/ManageJobsPage';

// Profile Page
import ProfilePage from './pages/ProfilePage';

// Settings Pages
import SettingsPage from './pages/SettingsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <CssBaseline />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Route */}
            <Route
              path="/dashboard"
              element={
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
                </ProtectedRoute>
              }
            />
            
            {/* Settings Routes - Available for all roles */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            
            {/* Role-based Jobs Route */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <RoleBasedJobsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Job Details Route */}
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
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
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
