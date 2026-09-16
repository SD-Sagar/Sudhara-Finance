const express = require('express');
const router = express.Router();
const { getAdminNotifications } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAdminNotifications);

module.exports = router;
