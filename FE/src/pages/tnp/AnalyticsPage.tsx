import { Container, Grid, Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { TrendingUp, People, Work, CheckCircle, Assessment } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';

const AnalyticsPage = () => {
  const placementStats = {
    totalStudents: 150,
    placedStudents: 120,
    placementRate: 80,
    avgPackage: 8.5,
    topCompanies: ['Tech Corp', 'Analytics Inc', 'Web Solutions', 'Data Systems'],
    courseWisePlacement: [
      { course: 'Computer Science', placed: 45, total: 50, rate: 90 },
      { course: 'Information Technology', placed: 35, total: 40, rate: 87.5 },
      { course: 'Electronics', placed: 25, total: 35, rate: 71.4 },
      { course: 'Mechanical', placed: 15, total: 25, rate: 60 }
    ]
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Assessment sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" gutterBottom>
            Placement Analytics
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h4" color="primary">
                    {placementStats.totalStudents}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Total Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h4" color="success.main">
                    {placementStats.placedStudents}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Placed Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h4" color="info.main">
                    {placementStats.placementRate}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Placement Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Work sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h4" color="warning.main">
                    {placementStats.avgPackage}L
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Avg Package (LPA)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course-wise Placement Statistics
                </Typography>
                {placementStats.courseWisePlacement.map((course, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">{course.course}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {course.placed}/{course.total} ({course.rate}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={course.rate} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Recruiting Companies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {placementStats.topCompanies.map((company, index) => (
                    <Chip 
                      key={index}
                      label={company} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
                  These companies have recruited the most students this year.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Placement Trends
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main">+15%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Increase from last year
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="info.main">45</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Companies visited
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="warning.main">12.5L</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Highest package offered
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default AnalyticsPage;
