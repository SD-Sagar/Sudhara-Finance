const express = require('express');
const router = express.Router();
const { authAdmin, authCustomer, logoutUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login requests per windowMs
    message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/admin', loginLimiter, authAdmin);
router.post('/customer', loginLimiter, authCustomer);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
