const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin/Manager)
router.get('/', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      role = '',
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
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Department filter
    if (department) {
      filter.department = department;
    }
    
    // Role filter
    if (role) {
      filter.role = role;
    }
    
    // Status filter
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(filter)
      .populate('department', 'name code')
      .populate('managerId', 'name email')
      .select('-password')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code description')
      .populate('managerId', 'name email role')
      .populate('directReports', 'name email role')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const {
      email,
      name,
      password,
      department,
      role = 'employee',
      managerId,
      employeeId,
      phoneNumber,
      position,
      joinDate
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employee ID is unique (if provided)
    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Validate department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department selected'
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

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      name,
      password,
      department,
      role,
      managerId: managerId || null,
      employeeId,
      phoneNumber,
      position,
      joinDate: joinDate || new Date()
    });

    await newUser.save();

    // Return user without password
    const userResponse = await User.findById(newUser._id)
      .populate('department', 'name code')
      .populate('managerId', 'name email')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
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
      message: 'Server error while creating user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      email,
      password,
      department,
      role,
      managerId,
      employeeId,
      phoneNumber,
      position,
      joinDate,
      isActive
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Authorization check: Admin can update anyone, users can only update themselves
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Check email uniqueness (if email is being changed)
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Check employee ID uniqueness (if being changed)
    if (employeeId && employeeId !== user.employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Validate department (if being changed)
    if (department && department !== user.department.toString()) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department selected'
        });
      }
    }

    // Validate manager (if being changed)
    if (managerId && managerId !== user.managerId?.toString()) {
      const managerExists = await User.findById(managerId);
      if (!managerExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager selected'
        });
      }
    }

    // Update fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.toLowerCase();
    if (password) updateFields.password = password; // Will be hashed by pre-save middleware
    if (department) updateFields.department = department;
    if (role && req.user.role === 'admin') updateFields.role = role; // Only admin can change roles
    if (managerId !== undefined) updateFields.managerId = managerId || null;
    if (employeeId !== undefined) updateFields.employeeId = employeeId;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (position !== undefined) updateFields.position = position;
    if (joinDate) updateFields.joinDate = joinDate;
    if (isActive !== undefined && req.user.role === 'admin') updateFields.isActive = isActive;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('managerId', 'name email')
      .select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
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
      message: 'Server error while updating user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (soft delete)
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    // Soft delete - deactivate user
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating user',
      error: error.message
    });
  }
});

// @route   GET /api/users/managers/list
// @desc    Get list of managers for assignment
// @access  Private (Admin)
router.get('/managers/list', auth, authorize(['admin']), async (req, res) => {
  try {
    const managers = await User.findManagers();
    
    res.json({
      success: true,
      data: managers
    });
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching managers',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/hierarchy
// @desc    Get user's reporting hierarchy
// @access  Private
router.get('/:id/hierarchy', auth, async (req, res) => {
  try {
    const userHierarchy = await User.getUserHierarchy(req.params.id);
    
    if (!userHierarchy) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: userHierarchy
    });
  } catch (error) {
    console.error('Error fetching user hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user hierarchy',
      error: error.message
    });
  }
});

// @route   GET /api/users/department/:departmentId
// @desc    Get users by department
// @access  Private
router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const users = await User.findByDepartment(req.params.departmentId);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users by department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by department',
      error: error.message
    });
  }
});

module.exports = router;

