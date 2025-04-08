const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['up', 'down', 'unknown'],
    default: 'unknown'
  },
  lastChecked: {
    type: Date,
    default: null
  },
  responseTime: {
    type: Number,
    default: null
  },
  uptime: {
    type: Number,
    default: 100
  },
  alerts: {
    email: {
      type: Boolean,
      default: true
    },
    webhook: {
      type: String,
      default: null
    }
  },
  checkInterval: {
    type: Number,
    default: 5, // minutes
    min: 1,
    max: 60
  },
  timeout: {
    type: Number,
    default: 30, // seconds
    min: 5,
    max: 300
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
websiteSchema.index({ owner: 1, isActive: 1 });

const Website = mongoose.model('Website', websiteSchema);

module.exports = Website; 