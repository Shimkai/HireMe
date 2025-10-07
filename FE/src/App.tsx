import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
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
                </ProtectedRoute>
              }
            />
            
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
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

