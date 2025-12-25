const express = require('express');
const router = express.Router();

// 1. Controller'dan fonksiyonları çekiyoruz
// Buraya 'simulateAutoAlarm' fonksiyonunu ekledik!
const { 
    getIncidents, 
    createPlannedOutage, 
    createInstantIncident, 
    resolveIncident,
    getSystemAlerts,
    simulateAutoAlarm // <--- YENİ EKLENEN
} = require('../controllers/incidentController');

// 2. Rotaları Tanımlıyoruz

// --- ÖZEL ROTALAR (En Üste) ---
// Sistem önce bu özel adresleri kontrol etsin diye en başa yazıyoruz.
router.get('/alerts', getSystemAlerts); 


// --- GENEL ROTALAR ---
router.get('/', getIncidents);
router.post('/planned', createPlannedOutage); 
router.post('/instant', createInstantIncident); 
router.put('/:id/coz', resolveIncident); 

module.exports = router;