import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Divider,
  Autocomplete,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { surveyApi, departmentApi, employeeApi } from '../../services/api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SurveyCreate = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const navigate = useNavigate();

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Survey name is required')
      .min(3, 'Survey name must be at least 3 characters'),
    publishDate: Yup.date()
      .required('Public date is required')
      .min(new Date(), 'Public date must be in the future'),
    noOfDays: Yup.number()
      .required('Duration is required')
      .positive('Duration must be positive')
      .integer('Duration must be a whole number'),
    department: Yup.string()
      .required('Department is required'),
    employees: Yup.array()
      .when('department', {
        is: 'all',
        then: (schema) => schema,
        otherwise: (schema) => schema.min(1, 'Select at least one employee')
      })
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: '',
      publishDate: null,
      noOfDays: 7,
      department: '',
      employees: []
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Format the data for API
        const surveyData = {
          ...values,
          publishDate: values.publishDate ? values.publishDate.toISOString() : null,
          employees: values.employees.map(emp => emp._id)
        };

        const result = await surveyApi.createSurvey(surveyData);
        if (result.success) {
          toast.success('Survey created successfully');
          navigate(`/surveys/${result.data._id}/questions/upload`);
        } else {
          toast.error(result.message || 'Failed to create survey');
        }
      } catch (error) {
        console.error('Error creating survey:', error);
        toast.error('An error occurred while creating the survey');
      } finally {
        setLoading(false);
      }
    }
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch employees when department changes
  useEffect(() => {
    if (formik.values.department && formik.values.department !== 'all') {
      fetchEmployeesByDepartment(formik.values.department);
    } else if (formik.values.department === 'all') {
      fetchAllEmployees();
    }
  }, [formik.values.department]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const result = await departmentApi.getDepartments({ active: 'true' });
      if (result.success) {
        // Add "All Departments" option
        const departmentOptions = [
          { _id: 'all', name: 'All Departments' },
          ...result.data
        ];
        setDepartments(departmentOptions);
      } else {
        toast.error('Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('An error occurred while fetching departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchEmployeesByDepartment = async (departmentId) => {
    setLoadingEmployees(true);
    try {
      const result = await employeeApi.getEmployeesByDepartment(departmentId, {
        includeSubdepartments: 'true',
        active: 'true'
      });
      if (result.success) {
        setFilteredEmployees(result.data);
      } else {
        toast.error('Failed to fetch employees');
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      toast.error('An error occurred while fetching employees');
      setFilteredEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchAllEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const result = await employeeApi.getEmployees({ active: 'true' });
      if (result.success) {
        setFilteredEmployees(result.data);
      } else {
        toast.error('Failed to fetch employees');
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching all employees:', error);
      toast.error('An error occurred while fetching employees');
      setFilteredEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleCancel = () => {
    navigate('/surveys');
  };

  const handleDateChange = (date) => {
    formik.setFieldValue('publishDate', date);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Survey
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Survey Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="publishDate"
                  name="publishDate"
                  label="Public Date"
                  type="date"
                  value={formik.values.publishDate ? new Date(formik.values.publishDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleDateChange(date);
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.publishDate && Boolean(formik.errors.publishDate)}
                  helperText={formik.touched.publishDate && formik.errors.publishDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="noOfDays"
                  name="noOfDays"
                  label="Duration (Days)"
                  type="number"
                  value={formik.values.noOfDays}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.noOfDays && Boolean(formik.errors.noOfDays)}
                  helperText={formik.touched.noOfDays && formik.errors.noOfDays}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl 
                  fullWidth
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  disabled={loadingDepartments}
                >
                  <InputLabel id="department-label">Target Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formik.values.department}
                    label="Target Department"
                    onChange={(e) => {
                      formik.setFieldValue('department', e.target.value);
                      // Reset employees when department changes
                      formik.setFieldValue('employees', []);
                    }}
                    onBlur={formik.handleBlur}
                  >
                    {loadingDepartments ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading departments...
                      </MenuItem>
                    ) : (
                      departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {formik.touched.department && formik.errors.department && (
                    <FormHelperText>{formik.errors.department}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {formik.values.department && formik.values.department !== 'all' && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    id="employees"
                    options={filteredEmployees}
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    value={formik.values.employees}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('employees', newValue);
                    }}
                    loading={loadingEmployees}
                    disabled={loadingEmployees}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Target Employees"
                        placeholder="Select employees"
                        error={formik.touched.employees && Boolean(formik.errors.employees)}
                        helperText={formik.touched.employees && formik.errors.employees}
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Survey'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SurveyCreate;
