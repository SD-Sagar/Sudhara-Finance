const express = require('express');
const router = express.Router();
const { getAdminNotifications } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/admin', protect, adminOnly, getAdminNotifications);

module.exports = router;
