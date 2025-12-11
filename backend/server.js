// CRITICAL: Load environment variables FIRST, before any other imports
// This ensures process.env variables are available when modules are loaded
// Explicitly specify the path to .env file in the backend directory
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Now import other modules (they can safely use process.env)
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const readingRoutes = require('./routes/readingRoutes');
const statsRoutes = require('./routes/statsRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const subscriberVerificationRoutes = require('./routes/subscriberVerificationRoutes');

// Verify MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is not defined in environment variables!');
  console.error('Please check your .env file or set MONGO_URI environment variable.');
  process.exit(1);
}

// Veritabanına bağlan (async, but we don't wait - server starts anyway)
// If DB connection fails, connectDB() will exit the process
connectDB().catch((error) => {
  console.error('❌ Database connection failed:', error);
  // connectDB already calls process.exit(1) on error, so this is just a safety net
});

const app = express();

// Middleware (Gelen veriyi JSON olarak okumayı sağlar)
app.use(express.json());
app.use(cors());

// Test Rotası (Çalışıyor mu diye bakmak için)
app.get('/', (req, res) => {
  res.send('API Calisiyor...');
});

// Health check endpoint - verify DB connection
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    success: true,
    status: 'ok',
    database: {
      state: dbStates[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    timestamp: new Date().toISOString()
  });
});

// Test route for verification system
app.get('/api/verification/subscriber/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Verification routes are working',
    timestamp: new Date().toISOString()
  });
});

// Register routes
app.use('/api/readings', readingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Verification routes - must be registered before error handler
app.use('/api/verification/subscriber', subscriberVerificationRoutes);

// Log registered routes for debugging
console.log('Registered routes:');
console.log('  - POST /api/verification/subscriber/initiate');
console.log('  - POST /api/verification/subscriber/verify');
console.log('  - POST /api/verification/subscriber/resend');
console.log('  - GET  /api/verification/subscriber/test');

// Error handling middleware (must be last, with 4 parameters)
app.use((err, req, res, next) => {
  // Only handle if response hasn't been sent
  if (!res.headersSent) {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
});

// 404 handler for undefined routes (must be absolute last)
app.use((req, res, next) => {
  // Only send 404 if response hasn't been sent
  if (!res.headersSent) {
    console.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.path}`
    });
  }
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Sunucu ${PORT} portunda calisiyor.`);
  console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/verification/subscriber/test`);
});