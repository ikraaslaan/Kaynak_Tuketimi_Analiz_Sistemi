// backend/models/Subscriber.js

const mongoose = require('mongoose');

// Şema Tanımı
const subscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // E-postanın benzersiz olması önemli
    trim: true,
    lowercase: true
  },
  neighborhood: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);