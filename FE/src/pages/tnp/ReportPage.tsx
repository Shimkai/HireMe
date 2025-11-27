import { Container, Grid, Card, CardContent, Typography, Button, Box, IconButton, CircularProgress, Alert, Switch, FormControlLabel, Chip } from '@mui/material';
import { Download, Refresh, Assessment, TrendingUp, People, Work, CheckCircle, AccessTime } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Sample data - this will be replaced with API calls
const sampleData = {
  studentsPerCompany: [
    { company: 'Tech Corp', students: 25 },
    { company: 'Analytics Inc', students: 18 },
    { company: 'Web Solutions', students: 32 },
    { company: 'Data Systems', students: 15 },
    { company: 'Cloud Tech', students: 22 },
    { company: 'AI Innovations', students: 28 }
  ],
  jobsByRecruiter: [
    { recruiter: 'John Smith', jobs: 12 },
    { recruiter: 'Sarah Johnson', jobs: 8 },
    { recruiter: 'Mike Wilson', jobs: 15 },
    { recruiter: 'Lisa Brown', jobs: 6 },
    { recruiter: 'David Lee', jobs: 10 }
  ],
  placementByBranch: [
    { branch: 'CSE', placed: 45, total: 60, percentage: 75 },
    { branch: 'IT', placed: 38, total: 50, percentage: 76 },
    { branch: 'ECE', placed: 32, total: 45, percentage: 71 },
    { branch: 'ME', placed: 25, total: 40, percentage: 62 },
    { branch: 'CE', placed: 18, total: 30, percentage: 60 }
  ],
  applicationsVsSelections: [
    { month: 'Jan', applications: 120, selections: 25 },
    { month: 'Feb', applications: 150, selections: 35 },
    { month: 'Mar', applications: 180, selections: 42 },
    { month: 'Apr', applications: 200, selections: 48 },
    { month: 'May', applications: 220, selections: 55 },
    { month: 'Jun', applications: 250, selections: 60 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ReportPage = () => {
  const [data, setData] = useState(sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      // Always try to fetch from API first for real-time data
      const response = await reportService.getReportData();
      setData(response);
      setLastUpdated(new Date());
      console.log('Real-time data fetched successfully:', response);
      setError(''); // Clear any previous errors
    } catch (apiError: any) {
      console.error('API error:', apiError);
      
      // Provide more specific error information
      if (apiError.code === 'ERR_NETWORK' || apiError.message?.includes('Network Error')) {
        setError('Backend server is not running. Please start the backend server on port 5000 to see real-time data.');
      } else if (apiError.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (apiError.response?.status === 403) {
        setError('Access denied. Only TnP users can access this data.');
      } else {
        setError(`Unable to fetch real-time data: ${apiError.response?.data?.error?.message || apiError.message || 'Unknown error'}`);
      }
      
      // Only use sample data as a last resort if API completely fails
      // But show a clear warning that this is dummy data
      if (apiError.code === 'ERR_NETWORK') {
        setData(sampleData);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    
    // Set up auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing report data...');
        fetchReportData();
      }, 30000); // 30 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoRefresh]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const downloadPDF = async (chartType: string) => {
    try {
      setDownloading(true);
      
      if (chartType === 'full-report') {
        await downloadFullReport();
        return;
      }

      // Find the chart element by type
      const chartElement = document.getElementById(`chart-${chartType}`);
      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      // Generate canvas from the chart
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 280;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`${chartType}-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const downloadFullReport = async () => {
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title page
      pdf.setFontSize(20);
      pdf.text('Placement Analytics Report', 105, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
      
      // Add summary statistics
      pdf.setFontSize(16);
      pdf.text('Summary Statistics', 20, 70);
      
      pdf.setFontSize(10);
      const totalStudents = data.studentsPerCompany.reduce((sum, item) => sum + item.students, 0);
      const totalJobs = data.jobsByRecruiter.reduce((sum, item) => sum + item.jobs, 0);
      const avgPlacementRate = Math.round(data.placementByBranch.reduce((sum, item) => sum + item.percentage, 0) / data.placementByBranch.length);
      
      pdf.text(`Total Students Placed: ${totalStudents}`, 20, 85);
      pdf.text(`Total Jobs Posted: ${totalJobs}`, 20, 95);
      pdf.text(`Average Placement Rate: ${avgPlacementRate}%`, 20, 105);
      pdf.text(`Active Companies: ${data.studentsPerCompany.length}`, 20, 115);
      
      // Add new page for charts
      pdf.addPage();
      
      // Capture and add each chart
      const chartIds = [
        'chart-students-per-company',
        'chart-jobs-by-recruiter',
        'chart-placement-by-branch',
        'chart-applications-vs-selections'
      ];
      
      for (let i = 0; i < chartIds.length; i++) {
        const chartElement = document.getElementById(chartIds[i]);
        if (chartElement) {
          // Add new page for each chart (except first)
          if (i > 0) {
            pdf.addPage();
          }
          
          // Add a small delay to ensure chart is rendered
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Center the image on the page
          const x = (297 - imgWidth) / 2; // A4 landscape width is 297mm
          const y = (210 - imgHeight) / 2; // A4 landscape height is 210mm
          
          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        }
      }
      
      // Download the PDF
      pdf.save('placement-analytics-full-report.pdf');
    } catch (error) {
      console.error('Error generating full report PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const refreshData = () => {
    fetchReportData();
  };

  if (loading && !data) {
    return (
      <MainLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assessment sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Placement Analytics Report
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {lastUpdated && (
                  <Chip
                    icon={<AccessTime />}
                    label={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {autoRefresh && (
                  <Chip
                    label="Auto-refresh: ON"
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-refresh"
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
              disabled={loading}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => downloadPDF('full-report')}
              disabled={downloading}
            >
              {downloading ? 'Generating PDF...' : 'Download Full Report'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
            <br />
            <Typography variant="caption" color="textSecondary">
              Data will refresh automatically every 30 seconds when auto-refresh is enabled.
            </Typography>
            {error.includes('Backend server is not running') && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  To start the backend server:
                </Typography>
                <Typography variant="body2" component="div">
                  1. Open a terminal/command prompt<br />
                  2. Navigate to the BE folder: <code>cd BE</code><br />
                  3. Start the server: <code>npm run dev</code><br />
                  4. Wait for "Server running on port 5000" message
                </Typography>
              </Box>
            )}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Fetching real-time data...
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Students Placed per Company */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Students Placed per Company
                  </Typography>
                  <IconButton onClick={() => downloadPDF('students-per-company')} size="small">
                    <Download />
                  </IconButton>
                </Box>
                <Box id="chart-students-per-company">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.studentsPerCompany}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="company" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Jobs Posted by Recruiters */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Jobs Posted by Recruiters
                  </Typography>
                  <IconButton onClick={() => downloadPDF('jobs-by-recruiter')} size="small">
                    <Download />
                  </IconButton>
                </Box>
                <Box id="chart-jobs-by-recruiter">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.jobsByRecruiter}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ recruiter, percent }) => `${recruiter} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="jobs"
                      >
                        {data.jobsByRecruiter.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Placement Statistics by Branch */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Placement Statistics by Branch
                  </Typography>
                  <IconButton onClick={() => downloadPDF('placement-by-branch')} size="small">
                    <Download />
                  </IconButton>
                </Box>
                <Box id="chart-placement-by-branch">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.placementByBranch}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="placed" fill="#00C49F" name="Placed Students" />
                      <Bar dataKey="total" fill="#FFBB28" name="Total Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Applications vs Selections Trend */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Applications vs Selections Trend
                  </Typography>
                  <IconButton onClick={() => downloadPDF('applications-vs-selections')} size="small">
                    <Download />
                  </IconButton>
                </Box>
                <Box id="chart-applications-vs-selections">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.applicationsVsSelections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="applications" stackId="1" stroke="#8884d8" fill="#8884d8" name="Applications" />
                      <Area type="monotone" dataKey="selections" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Selections" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" color="primary">
                        {data.statistics?.totalStudents || data.studentsPerCompany.reduce((sum, item) => sum + item.students, 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Students
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Work sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" color="success.main">
                        {data.statistics?.totalJobs || data.jobsByRecruiter.reduce((sum, item) => sum + item.jobs, 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Jobs Posted
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h4" color="info.main">
                        {data.statistics?.placementRate || Math.round(data.placementByBranch.reduce((sum, item) => sum + item.percentage, 0) / data.placementByBranch.length)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Placement Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <CheckCircle sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" color="warning.main">
                        {data.statistics?.totalSelections || data.studentsPerCompany.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Students Selected
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default ReportPage;
