const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all departments with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      includeEmployeeCount = 'false',
      status = 'all',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    let departments = await Department.find(filter)
      .populate('managerId', 'name email')
      .populate('parentDepartment', 'name code')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Include employee count if requested
    if (includeEmployeeCount === 'true') {
      departments = await Promise.all(
        departments.map(async (dept) => {
          const employeeCount = await User.countDocuments({ 
            department: dept._id, 
            isActive: true 
          });
          return {
            ...dept.toObject(),
            employeeCount
          };
        })
      );
    }

    // Get total count for pagination
    const totalDepartments = await Department.countDocuments(filter);
    const totalPages = Math.ceil(totalDepartments / parseInt(limit));

    res.json({
      success: true,
      data: departments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalDepartments,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching departments',
      error: error.message
    });
  }
});

// @route   GET /api/departments/tree
// @desc    Get department tree structure
// @access  Private
router.get('/tree', auth, async (req, res) => {
  try {
    const departmentTree = await Department.getDepartmentTree();
    
    res.json({
      success: true,
      data: departmentTree
    });
  } catch (error) {
    console.error('Error fetching department tree:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department tree',
      error: error.message
    });
  }
});

// @route   GET /api/departments/:id
// @desc    Get single department by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.getDepartmentWithEmployeeCount(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department',
      error: error.message
    });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      managerId,
      parentDepartment,
      budget = 0,
      location
    } = req.body;

    // Check if department name already exists
    const existingName = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Check if department code already exists
    const existingCode = await Department.findOne({ 
      code: code.toUpperCase() 
    });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Department with this code already exists'
      });
    }

    // Validate manager exists (if provided)
    if (managerId) {
      const managerExists = await User.findById(managerId);
      if (!managerExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager selected'
        });
      }
    }

    // Validate parent department exists (if provided)
    if (parentDepartment) {
      const parentExists = await Department.findById(parentDepartment);
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent department selected'
        });
      }
    }

    // Create new department
    const newDepartment = new Department({
      name,
      code: code.toUpperCase(),
      description,
      managerId: managerId || null,
      parentDepartment: parentDepartment || null,
      budget,
      location
    });

    await newDepartment.save();

    // Return department with populated fields
    const departmentResponse = await Department.findById(newDepartment._id)
      .populate('managerId', 'name email')
      .populate('parentDepartment', 'name code');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: departmentResponse
    });
  } catch (error) {
    console.error('Error creating department:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating department',
      error: error.message
    });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const departmentId = req.params.id;
    const {
      name,
      code,
      description,
      managerId,
      parentDepartment,
      budget,
      location,
      isActive
    } = req.body;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check name uniqueness (if name is being changed)
    if (name && name.toLowerCase() !== department.name.toLowerCase()) {
      const existingName = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: departmentId }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name already exists'
        });
      }
    }

    // Check code uniqueness (if code is being changed)
    if (code && code.toUpperCase() !== department.code) {
      const existingCode = await Department.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: departmentId }
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
    }

    // Validate manager (if being changed)
    if (managerId && managerId !== department.managerId?.toString()) {
      const managerExists = await User.findById(managerId);
      if (!managerExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager selected'
        });
      }
    }

    // Validate parent department and hierarchy (if being changed)
    if (parentDepartment !== undefined && parentDepartment !== department.parentDepartment?.toString()) {
      if (parentDepartment) {
        const parentExists = await Department.findById(parentDepartment);
        if (!parentExists) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parent department selected'
          });
        }

        // Validate hierarchy to prevent circular references
        const isValidHierarchy = await Department.validateHierarchy(departmentId, parentDepartment);
        if (!isValidHierarchy) {
          return res.status(400).json({
            success: false,
            message: 'Invalid hierarchy: circular reference detected'
          });
        }
      }
    }

    // Update fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (code) updateFields.code = code.toUpperCase();
    if (description !== undefined) updateFields.description = description;
    if (managerId !== undefined) updateFields.managerId = managerId || null;
    if (parentDepartment !== undefined) updateFields.parentDepartment = parentDepartment || null;
    if (budget !== undefined) updateFields.budget = budget;
    if (location !== undefined) updateFields.location = location;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('managerId', 'name email')
      .populate('parentDepartment', 'name code');

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating department',
      error: error.message
    });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active employees
    const employeeCount = await User.countDocuments({ 
      department: departmentId, 
      isActive: true 
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${employeeCount} active employees. Please reassign or deactivate employees first.`
      });
    }

    // Check if department has subdepartments
    const subDepartmentCount = await Department.countDocuments({ 
      parentDepartment: departmentId,
      isActive: true 
    });

    if (subDepartmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${subDepartmentCount} active subdepartments. Please reassign or delete subdepartments first.`
      });
    }

    // Delete department
    await Department.findByIdAndDelete(departmentId);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting department',
      error: error.message
    });
  }
});

// @route   GET /api/departments/:id/employees
// @desc    Get employees in a department
// @access  Private
router.get('/:id/employees', auth, async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { includeSubDepartments = 'false' } = req.query;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    let departmentIds = [departmentId];

    // Include subdepartments if requested
    if (includeSubDepartments === 'true') {
      const descendants = await department.getAllDescendants();
      departmentIds = departmentIds.concat(descendants.map(d => d._id));
    }

    // Get employees
    const employees = await User.find({ 
      department: { $in: departmentIds },
      isActive: true 
    })
      .populate('department', 'name code')
      .populate('managerId', 'name email')
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching department employees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department employees',
      error: error.message
    });
  }
});

// @route   GET /api/departments/:id/stats
// @desc    Get department statistics
// @access  Private (Admin/Manager)
router.get('/:id/stats', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get employee statistics
    const totalEmployees = await User.countDocuments({ 
      department: departmentId,
      isActive: true 
    });

    const employeesByRole = await User.aggregate([
      { $match: { department: mongoose.Types.ObjectId(departmentId), isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get subdepartment count
    const subDepartmentCount = await Department.countDocuments({ 
      parentDepartment: departmentId,
      isActive: true 
    });

    // Format role statistics
    const roleStats = {
      admin: 0,
      manager: 0,
      employee: 0
    };

    employeesByRole.forEach(role => {
      roleStats[role._id] = role.count;
    });

    const stats = {
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
        budget: department.budget,
        formattedBudget: department.formattedBudget
      },
      employees: {
        total: totalEmployees,
        byRole: roleStats
      },
      subDepartments: subDepartmentCount
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department statistics',
      error: error.message
    });
  }
});

module.exports = router;

