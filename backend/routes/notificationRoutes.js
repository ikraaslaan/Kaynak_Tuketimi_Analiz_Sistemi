const express = require('express');
const router = express.Router();
const { getUnreadNotifications } = require('../controllers/notificationController');

router.get('/unread', getUnreadNotifications);

module.exports = router;