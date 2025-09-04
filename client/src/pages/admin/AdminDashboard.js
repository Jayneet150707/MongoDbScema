import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { departmentApi, employeeApi, surveyApi } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalEmployees: 0,
    totalSurveys: 0,
    activeSurveys: 0,
    recentDepartments: [],
    recentEmployees: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch departments
      const departmentsResult = await departmentApi.getDepartments({ 
        limit: '5',
        includeEmployeeCount: 'true' 
      });
      
      // Fetch employees
      const employeesResult = await employeeApi.getEmployees({ 
        limit: '5',
        includeDepartment: 'true' 
      });

      // Fetch surveys
      const surveysResult = await surveyApi.getSurveys({ limit: '10' });

      if (departmentsResult.success && employeesResult.success && surveysResult.success) {
        const activeSurveys = surveysResult.data.filter(survey => {
          const now = new Date();
          const publishDate = new Date(survey.publishDate);
          const endDate = new Date(publishDate.getTime() + (survey.noOfDays * 24 * 60 * 60 * 1000));
          return now >= publishDate && now <= endDate;
        });

        setStats({
          totalDepartments: departmentsResult.data.length,
          totalEmployees: employeesResult.data.length,
          totalSurveys: surveysResult.data.length,
          activeSurveys: activeSurveys.length,
          recentDepartments: departmentsResult.data.slice(0, 3),
          recentEmployees: employeesResult.data.slice(0, 3)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', action }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.light`,
              color: `${color}.contrastText`,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      {action && (
        <CardActions>
          {action}
        </CardActions>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Overview of your organization's departments, employees, and surveys
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Departments"
              value={stats.totalDepartments}
              icon={<BusinessIcon />}
              color="primary"
              action={
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/admin/departments')}
                >
                  View All
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={<PeopleIcon />}
              color="success"
              action={
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  View All
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Surveys"
              value={stats.totalSurveys}
              icon={<AssignmentIcon />}
              color="info"
              action={
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/surveys')}
                >
                  View All
                </Button>
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Surveys"
              value={stats.activeSurveys}
              icon={<TrendingUpIcon />}
              color="warning"
              action={
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/surveys/create')}
                >
                  Create New
                </Button>
              }
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/admin/departments')}
                >
                  Manage Departments
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/surveys/create')}
                >
                  Create Survey
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Alert severity="success" variant="outlined">
                  All systems operational
                </Alert>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Database Connected" color="success" size="small" />
                  <Chip label="Email Service Active" color="success" size="small" />
                  <Chip label="API Healthy" color="success" size="small" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Departments
              </Typography>
              {stats.recentDepartments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No departments found
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.recentDepartments.map((dept) => (
                    <Box
                      key={dept._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {dept.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dept.code} • {dept.employeeCount || 0} employees
                        </Typography>
                      </Box>
                      <Chip
                        label={dept.isActive ? 'Active' : 'Inactive'}
                        color={dept.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/departments')}
                >
                  View All Departments
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Employees
              </Typography>
              {stats.recentEmployees.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No employees found
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.recentEmployees.map((employee) => (
                    <Box
                      key={employee._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.email} • {employee.department?.name || 'No department'}
                        </Typography>
                      </Box>
                      <Chip
                        label={employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        color={employee.role === 'admin' ? 'error' : employee.role === 'manager' ? 'warning' : 'primary'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/users')}
                >
                  View All Users
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;

