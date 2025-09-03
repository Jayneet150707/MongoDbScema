const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ConsentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  consentGiven: {
    type: Boolean,
    default: null
  },
  timestamp: {
    type: Date,
    default: null
  },
  consentToken: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4()
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  }
});

// Create a compound index for userId and surveyId
ConsentSchema.index({ userId: 1, surveyId: 1 }, { unique: true });

module.exports = mongoose.model('Consent', ConsentSchema);

