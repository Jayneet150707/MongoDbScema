const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  selectedOption: {
    type: String,
    required: [true, 'Please provide a selected option']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  anonymous: {
    type: Boolean,
    default: false
  }
});

// Create indexes for common queries
ResponseSchema.index({ surveyId: 1 });
ResponseSchema.index({ surveyId: 1, questionId: 1 });
ResponseSchema.index({ surveyId: 1, userId: 1 });

module.exports = mongoose.model('Response', ResponseSchema);

