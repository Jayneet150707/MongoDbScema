const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a survey name'],
    trim: true
  },
  publishDate: {
    type: Date,
    required: [true, 'Please provide a publish date']
  },
  durationDays: {
    type: Number,
    required: [true, 'Please provide duration in days'],
    min: 1
  },
  endDate: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    default: null
  },
  targetEmployees: {
    type: [String],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'pending_consent', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  consentDeadline: {
    type: Date,
    required: true
  }
});

// Create endDate from publishDate and durationDays
SurveySchema.pre('save', function(next) {
  if (this.publishDate && this.durationDays) {
    this.endDate = new Date(this.publishDate);
    this.endDate.setDate(this.endDate.getDate() + this.durationDays);
  }
  
  if (!this.consentDeadline) {
    this.consentDeadline = this.publishDate;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Survey', SurveySchema);

