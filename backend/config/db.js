const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB bağlantı adresi (Localhost veya Atlas URL'si buraya gelecek)
    // process.env.MONGO_URI, .env dosyasından okunacak
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined. Please check your .env file.');
    }

    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    const conn = await mongoose.connect(mongoURI, {
      // Connection options for better reliability
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Bağlandı: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    console.error('💡 Lütfen .env dosyanızda MONGO_URI değişkeninin tanımlı olduğundan emin olun.');
    process.exit(1); // Hata varsa uygulamayı durdur
  }
};

module.exports = connectDB;