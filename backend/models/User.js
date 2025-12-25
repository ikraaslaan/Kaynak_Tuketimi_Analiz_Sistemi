const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  // ✨ YENİ EKLENDİ: Mail atabilmemiz için şart
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // ✨ YENİ EKLENDİ: Hangi mahallede olduğunu bilmeliyiz ki kesinti olunca haber verelim
  mahalle: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'kullanici'],
    default: 'kullanici' // Varsayılan olarak herkes kullanıcı olsun
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);