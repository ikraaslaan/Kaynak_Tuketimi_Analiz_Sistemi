const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const readingRoutes = require('./routes/readingRoutes');
const statsRoutes = require('./routes/statsRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Ayarları yükle
dotenv.config();

// Veritabanına bağlan
connectDB();

const app = express();

// Middleware (Gelen veriyi JSON olarak okumayı sağlar)
app.use(express.json());
app.use(cors());

// Test Rotası (Çalışıyor mu diye bakmak için)
app.get('/', (req, res) => {
  res.send('API Calisiyor...');
});

app.use('/api/readings', readingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);


// Sunucuyu Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda calisiyor.`);
});