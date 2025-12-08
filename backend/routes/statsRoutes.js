const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');

// GET /api/stats/dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;