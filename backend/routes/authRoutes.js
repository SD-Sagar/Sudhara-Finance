const express = require('express');
const router = express.Router();
const { authAdmin, authCustomer, logoutUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { loginLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/admin', loginLimiter, authAdmin);
router.post('/customer', loginLimiter, authCustomer);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
