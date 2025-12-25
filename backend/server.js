const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Rota Dosyaları
const readingRoutes = require('./routes/readingRoutes');
const statsRoutes = require('./routes/statsRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const subscriberVerificationRoutes = require('./routes/subscriberVerificationRoutes');

dotenv.config();

const app = express();

// --- 1. MIDDLEWARE ---
// Frontend (3000) erişimi için CORS izni
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- 2. ROTALAR ---
app.use('/api/readings', readingRoutes);
app.use('/api/stats', statsRoutes);          
app.use('/api/incidents', incidentRoutes);   
app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/verification/subscriber', subscriberVerificationRoutes);

// Test Rotası
app.get('/', (req, res) => res.send('API Calisiyor...'));

// 404 Handler (Rota bulunamazsa)
app.use((req, res, next) => {
    if (!res.headersSent) {
        res.status(404).json({ success: false, message: `Rota bulunamadı: ${req.method} ${req.path}` });
    }
});

// --- 3. VERİTABANI BAĞLANTISI ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Başarıyla Bağlandı');
    } catch (err) {
        console.error('❌ MongoDB Hatası:', err.message);
    }
};

// --- 4. SUNUCUYU BAŞLAT VE GRACEFUL SHUTDOWN AYARI ---
const PORT = process.env.PORT || 5001;

// Sunucuyu bir değişkene atıyoruz ki sonra kapatabilelim
const server = app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Sunucu ${PORT} portunda sorunsuz çalışıyor.`);
});

// CTRL + C (SIGINT) sinyalini yakala
process.on('SIGINT', () => {
    console.log('\n🛑 Sunucu kapatılıyor... (Kapatma sinyali alındı)');

    // Önce sunucuyu yeni isteklere kapat
    server.close(() => {
        console.log('✅ HTTP sunucusu kapandı.');

        // Sonra MongoDB bağlantısını güvenli şekilde kes
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB bağlantısı kesildi.');
            // En son işlemi tamamen bitir
            process.exit(0); 
        });
    });
});