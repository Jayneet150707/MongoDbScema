const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: [50, 'Employee ID cannot exceed 50 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  directReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name display
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Virtual for initials (for avatar)
userSchema.virtual('initials').get(function() {
  return this.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ department: 1 });
userSchema.index({ managerId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get user without sensitive information
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find users by department
userSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isActive: true })
    .populate('department', 'name code')
    .populate('managerId', 'name email')
    .select('-password');
};

// Static method to find managers
userSchema.statics.findManagers = function() {
  return this.find({ 
    role: { $in: ['admin', 'manager'] }, 
    isActive: true 
  })
    .populate('department', 'name code')
    .select('-password')
    .sort({ name: 1 });
};

// Static method to get user hierarchy
userSchema.statics.getUserHierarchy = async function(userId) {
  const user = await this.findById(userId)
    .populate('department', 'name code')
    .populate('managerId', 'name email role')
    .populate('directReports', 'name email role')
    .select('-password');
  
  return user;
};

// Pre-remove middleware to handle cascading deletes
userSchema.pre('remove', async function(next) {
  try {
    // Update direct reports to remove this manager
    await this.constructor.updateMany(
      { managerId: this._id },
      { $unset: { managerId: 1 } }
    );
    
    // Remove from any direct reports arrays
    await this.constructor.updateMany(
      { directReports: this._id },
      { $pull: { directReports: this._id } }
    );
    
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update manager's direct reports
userSchema.post('save', async function(doc, next) {
  try {
    if (doc.managerId) {
      // Add this user to manager's direct reports if not already present
      await this.constructor.findByIdAndUpdate(
        doc.managerId,
        { $addToSet: { directReports: doc._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);

