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
  Avatar,
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
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { ThemeProvider } from '@mui/material/styles';
import paisaloTheme from '../../theme/paisaloTheme';

// Mock API functions - replace with actual API calls
const userApi = {
  getUsers: async (params) => {
    // Mock implementation
    return {
      success: true,
      data: [
        {
          _id: '68b812a897cc4cf13402ec8f',
          email: 'tl2@paisalo.in',
          name: 'Jaydev Panchal',
          department: { _id: 'dept1', name: 'ADMIN', code: 'ADM' },
          role: 'admin',
          managerId: null,
          employeeId: 'EMP001',
          phoneNumber: '+91-9876543210',
          position: 'Team Lead',
          joinDate: '2025-09-03T10:04:24.667Z',
          isActive: true,
          initials: 'JP'
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  },
  createUser: async (userData) => {
    return { success: true, data: userData };
  },
  updateUser: async (id, userData) => {
    return { success: true, data: userData };
  },
  deleteUser: async (id) => {
    return { success: true };
  }
};

const departmentApi = {
  getDepartments: async () => {
    return {
      success: true,
      data: [
        { _id: 'dept1', name: 'ADMIN', code: 'ADM' },
        { _id: 'dept2', name: 'Finance', code: 'FIN' },
        { _id: 'dept3', name: 'Operations', code: 'OPS' }
      ]
    };
  }
};

const PaisaloUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    role: '',
    status: 'all'
  });

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .when('isEditing', {
        is: false,
        then: Yup.string().required('Password is required')
      }),
    department: Yup.string().required('Department is required'),
    role: Yup.string().required('Role is required'),
    employeeId: Yup.string().max(50, 'Employee ID cannot exceed 50 characters'),
    phoneNumber: Yup.string()
      .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
    position: Yup.string().max(100, 'Position cannot exceed 100 characters')
  });

  // Form handling
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      department: '',
      role: 'employee',
      managerId: '',
      employeeId: '',
      phoneNumber: '',
      position: '',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      isEditing: false
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const userData = { ...values };
        delete userData.isEditing;

        if (editingUser) {
          const result = await userApi.updateUser(editingUser._id, userData);
          if (result.success) {
            toast.success('User updated successfully');
            fetchUsers();
          }
        } else {
          const result = await userApi.createUser(userData);
          if (result.success) {
            toast.success('User created successfully');
            fetchUsers();
          }
        }
        
        handleCloseDialog();
        resetForm();
      } catch (error) {
        toast.error('Error saving user');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      
      const result = await userApi.getUsers(params);
      if (result.success) {
        setUsers(result.data);
        setTotalUsers(result.pagination.totalUsers);
      }
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const result = await departmentApi.getDepartments();
      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      toast.error('Error fetching departments');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Event handlers
  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      formik.setValues({
        ...user,
        password: '',
        department: user.department._id,
        managerId: user.managerId?._id || '',
        joinDate: user.joinDate ? user.joinDate.split('T')[0] : '',
        isEditing: true
      });
    } else {
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    formik.resetForm();
    setShowPassword(false);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const result = await userApi.deleteUser(userId);
        if (result.success) {
          toast.success('User deactivated successfully');
          fetchUsers();
        }
      } catch (error) {
        toast.error('Error deactivating user');
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
      department: '',
      role: '',
      status: 'all'
    });
    setPage(0);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  return (
    <ThemeProvider theme={paisaloTheme}>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                User Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage employees, departments, and user roles in Paisalo Digital Limited
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
              Add New User
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'paisalo.lightBlue', border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
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
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                        {departments.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Departments
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
                      <BadgeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                        {users.filter(u => u.isActive).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
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
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                        {users.filter(u => u.role === 'admin').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administrators
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
              Filters & Search
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
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
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    label="Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
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
                  sx={{ mr: 1 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Users Table */}
          <Paper sx={{ border: '1px solid', borderColor: 'divider' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'paisalo.lightBlue' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Join Date</TableCell>
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
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                mr: 2,
                                width: 40,
                                height: 40,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              {user.initials || user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.employeeId || 'No ID'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            {user.phoneNumber && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {user.phoneNumber}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.department.name}
                            size="small"
                            sx={{
                              bgcolor: 'secondary.light',
                              color: 'secondary.contrastText',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(user.isActive)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(user)}
                                sx={{ color: 'primary.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deactivate User">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user._id)}
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
              count={totalUsers}
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

          {/* Add/Edit User Dialog */}
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
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
              <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Full Name"
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
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="password"
                      label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      required={!editingUser}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="employeeId"
                      label="Employee ID"
                      value={formik.values.employeeId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                      helperText={formik.touched.employeeId && formik.errors.employeeId}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      error={formik.touched.department && Boolean(formik.errors.department)}
                    >
                      <InputLabel>Department *</InputLabel>
                      <Select
                        name="department"
                        value={formik.values.department}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Department *"
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name} ({dept.code})
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.department && formik.errors.department && (
                        <FormHelperText>{formik.errors.department}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      error={formik.touched.role && Boolean(formik.errors.role)}
                    >
                      <InputLabel>Role *</InputLabel>
                      <Select
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Role *"
                      >
                        <MenuItem value="employee">Employee</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="admin">Administrator</MenuItem>
                      </Select>
                      {formik.touched.role && formik.errors.role && (
                        <FormHelperText>{formik.errors.role}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="phoneNumber"
                      label="Phone Number"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                      helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                      placeholder="+91-9876543210"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="position"
                      label="Position/Title"
                      value={formik.values.position}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.position && Boolean(formik.errors.position)}
                      helperText={formik.touched.position && formik.errors.position}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="joinDate"
                      label="Join Date"
                      type="date"
                      value={formik.values.joinDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      InputLabelProps={{ shrink: true }}
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
                    editingUser ? 'Update User' : 'Create User'
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

export default PaisaloUserManagement;

