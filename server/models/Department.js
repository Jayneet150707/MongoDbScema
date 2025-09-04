const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    minlength: [2, 'Department name must be at least 2 characters long'],
    maxlength: [100, 'Department name cannot exceed 100 characters'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    trim: true,
    uppercase: true,
    minlength: [2, 'Department code must be at least 2 characters long'],
    maxlength: [10, 'Department code cannot exceed 10 characters'],
    unique: true,
    match: [/^[A-Z0-9]+$/, 'Department code can only contain uppercase letters and numbers']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  subDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  establishedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted budget
departmentSchema.virtual('formattedBudget').get(function() {
  if (this.budget === 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(this.budget);
});

// Virtual for hierarchy level
departmentSchema.virtual('level').get(function() {
  let level = 0;
  let current = this.parentDepartment;
  while (current) {
    level++;
    current = current.parentDepartment;
  }
  return level;
});

// Index for better query performance
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ managerId: 1 });
departmentSchema.index({ isActive: 1 });

// Pre-save middleware to ensure code is uppercase
departmentSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Static method to get department tree
departmentSchema.statics.getDepartmentTree = async function() {
  const departments = await this.find({ isActive: true })
    .populate('managerId', 'name email')
    .populate('parentDepartment', 'name code')
    .sort({ name: 1 });
  
  // Build tree structure
  const departmentMap = {};
  const rootDepartments = [];
  
  // First pass: create map
  departments.forEach(dept => {
    departmentMap[dept._id] = {
      ...dept.toObject(),
      children: []
    };
  });
  
  // Second pass: build tree
  departments.forEach(dept => {
    if (dept.parentDepartment) {
      const parent = departmentMap[dept.parentDepartment._id];
      if (parent) {
        parent.children.push(departmentMap[dept._id]);
      }
    } else {
      rootDepartments.push(departmentMap[dept._id]);
    }
  });
  
  return rootDepartments;
};

// Static method to get department with employee count
departmentSchema.statics.getDepartmentWithEmployeeCount = async function(departmentId) {
  const User = mongoose.model('User');
  
  const department = await this.findById(departmentId)
    .populate('managerId', 'name email')
    .populate('parentDepartment', 'name code');
  
  if (!department) return null;
  
  const employeeCount = await User.countDocuments({ 
    department: departmentId, 
    isActive: true 
  });
  
  return {
    ...department.toObject(),
    employeeCount
  };
};

// Static method to validate department hierarchy (prevent circular references)
departmentSchema.statics.validateHierarchy = async function(departmentId, parentId) {
  if (!parentId) return true;
  
  let currentParent = await this.findById(parentId);
  const visited = new Set();
  
  while (currentParent) {
    if (visited.has(currentParent._id.toString())) {
      return false; // Circular reference detected
    }
    
    if (currentParent._id.toString() === departmentId) {
      return false; // Cannot be parent of itself
    }
    
    visited.add(currentParent._id.toString());
    currentParent = currentParent.parentDepartment ? 
      await this.findById(currentParent.parentDepartment) : null;
  }
  
  return true;
};

// Pre-save middleware to validate hierarchy
departmentSchema.pre('save', async function(next) {
  if (this.parentDepartment) {
    const isValid = await this.constructor.validateHierarchy(
      this._id, 
      this.parentDepartment
    );
    
    if (!isValid) {
      const error = new Error('Invalid department hierarchy: circular reference detected');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update parent's subdepartments
departmentSchema.post('save', async function(doc, next) {
  try {
    if (doc.parentDepartment) {
      await this.constructor.findByIdAndUpdate(
        doc.parentDepartment,
        { $addToSet: { subDepartments: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove middleware to handle cascading operations
departmentSchema.pre('remove', async function(next) {
  try {
    const User = mongoose.model('User');
    
    // Check if department has employees
    const employeeCount = await User.countDocuments({ 
      department: this._id, 
      isActive: true 
    });
    
    if (employeeCount > 0) {
      const error = new Error(`Cannot delete department with ${employeeCount} active employees`);
      error.name = 'ValidationError';
      return next(error);
    }
    
    // Update subdepartments to remove parent reference
    await this.constructor.updateMany(
      { parentDepartment: this._id },
      { $unset: { parentDepartment: 1 } }
    );
    
    // Remove from parent's subdepartments array
    if (this.parentDepartment) {
      await this.constructor.findByIdAndUpdate(
        this.parentDepartment,
        { $pull: { subDepartments: this._id } }
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to get all descendants
departmentSchema.methods.getAllDescendants = async function() {
  const descendants = [];
  const queue = [this._id];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await this.constructor.find({ 
      parentDepartment: currentId,
      isActive: true 
    });
    
    children.forEach(child => {
      descendants.push(child);
      queue.push(child._id);
    });
  }
  
  return descendants;
};

module.exports = mongoose.model('Department', departmentSchema);

