const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a survey name'],
    trim: true,
    maxlength: [200, 'Survey name cannot be more than 200 characters']
  },
  publicDate: {
    type: Date,
    required: [true, 'Please provide a public date']
  },
  noOfDays: {
    type: Number,
    required: [true, 'Please provide duration in days'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: 'Department',
    required: [true, 'Please provide target department']
  },
  employees: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft'
  },
  // Token for anonymous access
  anonymousToken: {
    type: String,
    unique: true
  },
  // Email settings
  consentEmailSent: {
    type: Boolean,
    default: false
  },
  surveyEmailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
SurveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate anonymous token before saving
SurveySchema.pre('save', function(next) {
  if (!this.anonymousToken) {
    this.anonymousToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Virtual for end date
SurveySchema.virtual('endDate').get(function() {
  const endDate = new Date(this.publicDate);
  endDate.setDate(endDate.getDate() + this.noOfDays);
  return endDate;
});

// Virtual for survey status based on dates
SurveySchema.virtual('currentStatus').get(function() {
  const now = new Date();
  const publicDate = new Date(this.publicDate);
  const endDate = this.endDate;

  if (now < publicDate) {
    return 'upcoming';
  } else if (now >= publicDate && now <= endDate) {
    return 'active';
  } else {
    return 'closed';
  }
});

// Method to check if survey is active
SurveySchema.methods.isActive = function() {
  const now = new Date();
  const publicDate = new Date(this.publicDate);
  const endDate = this.endDate;
  
  return now >= publicDate && now <= endDate;
};

// Method to check if consent period is active
SurveySchema.methods.isConsentPeriodActive = function() {
  const now = new Date();
  const publicDate = new Date(this.publicDate);
  
  return now < publicDate;
};

// Ensure virtual fields are serialized
SurveySchema.set('toJSON', { virtuals: true });
SurveySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Survey', SurveySchema);
