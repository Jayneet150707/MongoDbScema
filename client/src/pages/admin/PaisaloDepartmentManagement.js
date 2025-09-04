import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { ThemeProvider } from '@mui/material/styles';
import paisaloTheme from '../../theme/paisaloTheme';

// Mock API functions - replace with actual API calls
const departmentApi = {
  getDepartments: async (params) => {
    return {
      success: true,
      data: [
        {
          _id: 'dept1',
          name: 'ADMIN',
          code: 'ADM',
          description: 'Administrative Department',
          managerId: { _id: 'mgr1', name: 'Jaydev Panchal', email: 'tl2@paisalo.in' },
          parentDepartment: null,
          budget: 5000000,
          location: 'Head Office',
          isActive: true,
          employeeCount: 5,
          establishedDate: '2025-01-01T00:00:00.000Z'
        },
        {
          _id: 'dept2',
          name: 'Finance',
          code: 'FIN',
          description: 'Financial Operations and Management',
          managerId: null,
          parentDepartment: null,
          budget: 10000000,
          location: 'Mumbai Office',
          isActive: true,
          employeeCount: 12,
          establishedDate: '2025-01-01T00:00:00.000Z'
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalDepartments: 2,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  },
  createDepartment: async (deptData) => {
    return { success: true, data: deptData };
  },
  updateDepartment: async (id, deptData) => {
    return { success: true, data: deptData };
  },
  deleteDepartment: async (id) => {
    return { success: true };
  }
};

const userApi = {
  getManagers: async () => {
    return {
      success: true,
      data: [
        { _id: 'mgr1', name: 'Jaydev Panchal', email: 'tl2@paisalo.in', role: 'admin' }
      ]
    };
  }
};

const PaisaloDepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  
  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalDepartments: 0,
    activeDepartments: 0,
    totalEmployees: 0,
    totalBudget: 0
  });

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name cannot exceed 100 characters')
      .required('Department name is required'),
    code: Yup.string()
      .min(2, 'Department code must be at least 2 characters')
      .max(10, 'Department code cannot exceed 10 characters')
      .matches(/^[A-Z0-9]+$/, 'Department code can only contain uppercase letters and numbers')
      .required('Department code is required'),
    description: Yup.string()
      .max(500, 'Description cannot exceed 500 characters'),
    budget: Yup.number()
      .min(0, 'Budget cannot be negative')
      .nullable(),
    location: Yup.string()
      .max(200, 'Location cannot exceed 200 characters')
  });

  // Form handling
  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      description: '',
      managerId: '',
      parentDepartment: '',
      budget: '',
      location: '',
      isActive: true
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const deptData = {
          ...values,
          code: values.code.toUpperCase(),
          budget: values.budget ? parseFloat(values.budget) : 0
        };

        if (editingDepartment) {
          const result = await departmentApi.updateDepartment(editingDepartment._id, deptData);
          if (result.success) {
            toast.success('Department updated successfully');
            fetchDepartments();
          }
        } else {
          const result = await departmentApi.createDepartment(deptData);
          if (result.success) {
            toast.success('Department created successfully');
            fetchDepartments();
          }
        }
        
        handleCloseDialog();
        resetForm();
      } catch (error) {
        toast.error('Error saving department');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch data
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        includeEmployeeCount: 'true',
        ...filters
      };
      
      const result = await departmentApi.getDepartments(params);
      if (result.success) {
        setDepartments(result.data);
        setTotalDepartments(result.pagination.totalDepartments);
        
        // Calculate statistics
        const totalEmployees = result.data.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0);
        const totalBudget = result.data.reduce((sum, dept) => sum + (dept.budget || 0), 0);
        const activeDepartments = result.data.filter(dept => dept.isActive).length;
        
        setStats({
          totalDepartments: result.data.length,
          activeDepartments,
          totalEmployees,
          totalBudget
        });
      }
    } catch (error) {
      toast.error('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const result = await userApi.getManagers();
      if (result.success) {
        setManagers(result.data);
      }
    } catch (error) {
      toast.error('Error fetching managers');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchManagers();
  }, []);

  // Event handlers
  const handleOpenDialog = (department = null) => {
    setEditingDepartment(department);
    if (department) {
      formik.setValues({
        name: department.name,
        code: department.code,
        description: department.description || '',
        managerId: department.managerId?._id || '',
        parentDepartment: department.parentDepartment?._id || '',
        budget: department.budget || '',
        location: department.location || '',
        isActive: department.isActive
      });
    } else {
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDepartment(null);
    formik.resetForm();
  };

  const handleDeleteDepartment = async (deptId, employeeCount) => {
    if (employeeCount > 0) {
      toast.error(`Cannot delete department with ${employeeCount} employees. Please reassign employees first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const result = await departmentApi.deleteDepartment(deptId);
        if (result.success) {
          toast.success('Department deleted successfully');
          fetchDepartments();
        }
      } catch (error) {
        toast.error('Error deleting department');
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all'
    });
    setPage(0);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyShort = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <ThemeProvider theme={paisaloTheme}>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                Department Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage organizational departments and structure at Paisalo Digital Limited
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: 2,
                px: 3,
                py: 1.5
              }}
            >
              Add Department
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'paisalo.lightBlue', border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {stats.totalDepartments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Departments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#E8F5E8', border: '1px solid', borderColor: 'success.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                        {stats.activeDepartments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Departments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'paisalo.lightOrange', border: '1px solid', borderColor: 'secondary.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                        {stats.totalEmployees}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Employees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#FFF8E1', border: '1px solid', borderColor: 'warning.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <AccountBalanceIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                        {formatCurrencyShort(stats.totalBudget)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Budget
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Search & Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search departments..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Departments Table */}
          <Paper sx={{ border: '1px solid', borderColor: 'divider' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'paisalo.lightBlue' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Manager</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Employees</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Budget</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress color="primary" />
                      </TableCell>
                    </TableRow>
                  ) : departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No departments found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((department) => (
                      <TableRow key={department._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {department.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Code: {department.code}
                            </Typography>
                            {department.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {department.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {department.managerId ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {department.managerId.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {department.managerId.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No manager assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${department.employeeCount || 0} employees`}
                            size="small"
                            sx={{
                              bgcolor: department.employeeCount > 0 ? 'success.light' : 'grey.200',
                              color: department.employeeCount > 0 ? 'success.contrastText' : 'text.secondary',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                            {formatCurrency(department.budget)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {department.location || 'Not specified'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={department.isActive ? 'Active' : 'Inactive'}
                            color={department.isActive ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Department">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(department)}
                                sx={{ color: 'primary.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Department">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDepartment(department._id, department.employeeCount)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalDepartments}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Paper>

          {/* Add/Edit Department Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(21,101,192,0.15)'
              }
            }}
          >
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700 }}>
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
              <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Department Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="code"
                      label="Department Code"
                      value={formik.values.code}
                      onChange={(e) => {
                        formik.setFieldValue('code', e.target.value.toUpperCase());
                      }}
                      onBlur={formik.handleBlur}
                      error={formik.touched.code && Boolean(formik.errors.code)}
                      helperText={formik.touched.code && formik.errors.code}
                      required
                      placeholder="e.g., ADM, FIN, OPS"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      placeholder="Brief description of the department's role and responsibilities"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Manager</InputLabel>
                      <Select
                        name="managerId"
                        value={formik.values.managerId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Manager"
                      >
                        <MenuItem value="">No manager assigned</MenuItem>
                        {managers.map((manager) => (
                          <MenuItem key={manager._id} value={manager._id}>
                            {manager.name} ({manager.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="budget"
                      label="Budget (₹)"
                      type="number"
                      value={formik.values.budget}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.budget && Boolean(formik.errors.budget)}
                      helperText={formik.touched.budget && formik.errors.budget}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                      }}
                      placeholder="0"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="location"
                      label="Location"
                      value={formik.values.location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.location && Boolean(formik.errors.location)}
                      helperText={formik.touched.location && formik.errors.location}
                      placeholder="e.g., Head Office, Mumbai Branch, Delhi Office"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, bgcolor: 'background.secondary' }}>
                <Button
                  onClick={handleCloseDialog}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    editingDepartment ? 'Update Department' : 'Create Department'
                  )}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default PaisaloDepartmentManagement;

