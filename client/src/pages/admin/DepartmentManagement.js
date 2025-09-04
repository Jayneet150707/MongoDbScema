import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { departmentApi, employeeApi } from '../../services/api';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Department name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    code: Yup.string()
      .required('Department code is required')
      .min(2, 'Code must be at least 2 characters')
      .max(10, 'Code cannot exceed 10 characters')
      .matches(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
    description: Yup.string()
      .max(500, 'Description cannot exceed 500 characters'),
    managerId: Yup.string(),
    parentDepartment: Yup.string(),
    budget: Yup.number()
      .min(0, 'Budget cannot be negative'),
    location: Yup.string()
      .max(200, 'Location cannot exceed 200 characters')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      description: '',
      managerId: '',
      parentDepartment: '',
      budget: 0,
      location: '',
      isActive: true
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const departmentData = {
          ...values,
          managerId: values.managerId || null,
          parentDepartment: values.parentDepartment || null,
          budget: Number(values.budget) || 0
        };

        let result;
        if (editingDepartment) {
          result = await departmentApi.updateDepartment(editingDepartment._id, departmentData);
        } else {
          result = await departmentApi.createDepartment(departmentData);
        }

        if (result.success) {
          toast.success(`Department ${editingDepartment ? 'updated' : 'created'} successfully`);
          handleCloseDialog();
          fetchDepartments();
        } else {
          toast.error(result.message || `Failed to ${editingDepartment ? 'update' : 'create'} department`);
        }
      } catch (error) {
        console.error('Error saving department:', error);
        toast.error('An error occurred while saving the department');
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const result = await departmentApi.getDepartments({
        includeEmployeeCount: 'true',
        includeManager: 'true'
      });
      if (result.success) {
        setDepartments(result.data);
      } else {
        toast.error('Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('An error occurred while fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const result = await employeeApi.getManagers();
      if (result.success) {
        setManagers(result.data);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleOpenDialog = (department = null) => {
    setEditingDepartment(department);
    if (department) {
      formik.setValues({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        managerId: department.managerId?._id || '',
        parentDepartment: department.parentDepartment?._id || '',
        budget: department.budget || 0,
        location: department.location || '',
        isActive: department.isActive !== false
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

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      const result = await departmentApi.deleteDepartment(departmentToDelete._id);
      if (result.success) {
        toast.success('Department deleted successfully');
        fetchDepartments();
      } else {
        toast.error(result.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('An error occurred while deleting the department');
    } finally {
      setDeleteConfirmOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginate filtered departments
  const paginatedDepartments = filteredDepartments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="large" />
            Department Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDepartments} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Department
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search departments..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total: {filteredDepartments.length} departments
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Departments Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Parent Department</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm ? 'No departments found matching your search.' : 'No departments found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDepartments.map((department) => (
                    <TableRow key={department._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {department.name}
                          </Typography>
                          {department.description && (
                            <Typography variant="caption" color="text.secondary">
                              {department.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={department.code} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {department.managerId ? (
                          <Box>
                            <Typography variant="body2">
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
                        {department.parentDepartment ? (
                          <Chip 
                            label={department.parentDepartment.name} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Root Department
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {department.employeeCount || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {department.budget ? (
                          <Typography variant="body2">
                            ${department.budget.toLocaleString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not set
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={department.isActive ? 'Active' : 'Inactive'}
                          color={department.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(department)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(department)}
                              color="error"
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredDepartments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Add/Edit Department Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="name"
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="code"
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="manager-label">Manager</InputLabel>
                    <Select
                      labelId="manager-label"
                      id="managerId"
                      name="managerId"
                      value={formik.values.managerId}
                      label="Manager"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="">
                        <em>No manager assigned</em>
                      </MenuItem>
                      {managers.map((manager) => (
                        <MenuItem key={manager._id} value={manager._id}>
                          {manager.name} ({manager.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="parent-label">Parent Department</InputLabel>
                    <Select
                      labelId="parent-label"
                      id="parentDepartment"
                      name="parentDepartment"
                      value={formik.values.parentDepartment}
                      label="Parent Department"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="">
                        <em>Root Department</em>
                      </MenuItem>
                      {departments
                        .filter(dept => dept._id !== editingDepartment?._id)
                        .map((department) => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.name} ({department.code})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="budget"
                    name="budget"
                    label="Budget"
                    type="number"
                    value={formik.values.budget}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.budget && Boolean(formik.errors.budget)}
                    helperText={formik.touched.budget && formik.errors.budget}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="location"
                    name="location"
                    label="Location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.location && Boolean(formik.errors.location)}
                    helperText={formik.touched.location && formik.errors.location}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="isActive"
                      name="isActive"
                      value={formik.values.isActive}
                      label="Status"
                      onChange={formik.handleChange}
                    >
                      <MenuItem value={true}>Active</MenuItem>
                      <MenuItem value={false}>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={formik.handleSubmit}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? (
                <CircularProgress size={20} />
              ) : (
                editingDepartment ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete the department "{departmentToDelete?.name}"?
            </Typography>
            {departmentToDelete?.employeeCount > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                This department has {departmentToDelete.employeeCount} employees. 
                Please reassign them before deleting.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={departmentToDelete?.employeeCount > 0}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default DepartmentManagement;

