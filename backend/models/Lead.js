const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  businessOwnerName: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  problem: {
    type: String,
    required: true,
    trim: true
  },
  niche: {
    type: String,
    required: true,
    enum: ['coaching', 'clinic', 'restaurant', 'retail', 'service', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['not-contacted', 'contacted', 'interested', 'not-interested', 'converted'],
    default: 'not-contacted'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster searches
leadSchema.index({ businessOwnerName: 'text', problem: 'text', address: 'text' });
leadSchema.index({ niche: 1, status: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
