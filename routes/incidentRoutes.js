const express = require('express');
const router = express.Router();
const { getIncidents, createIncident, resolveIncident } = require('../controllers/incidentController');

router.get('/', getIncidents);           // Arızaları listele
router.post('/', createIncident);        // Yeni kesinti ekle
router.put('/:id/coz', resolveIncident); // Arızayı kapat

module.exports = router;