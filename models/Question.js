const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 4;
      },
      message: 'Options must have between 2 and 4 items'
    },
    required: [true, 'Please provide options']
  },
  parameter: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Question', QuestionSchema);

