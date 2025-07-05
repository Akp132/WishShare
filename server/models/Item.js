const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  wishlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  imageUrl: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  url: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'purchased'],
    default: 'available'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Update updatedAt on save
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
itemSchema.index({ wishlistId: 1 });
itemSchema.index({ addedBy: 1 });

module.exports = mongoose.model('Item', itemSchema);