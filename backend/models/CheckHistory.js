const mongoose = require('mongoose');

const checkHistorySchema = new mongoose.Schema({
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  status: {
    type: String,
    enum: ['up', 'down', 'unknown'],
    required: true
  },
  responseTime: {
    type: Number,
    required: false
  },
  statusCode: {
    type: Number,
    default: 0,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
checkHistorySchema.index({ website: 1, timestamp: -1 });

module.exports = mongoose.model('CheckHistory', checkHistorySchema); 