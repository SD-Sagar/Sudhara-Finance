const express = require('express');
const router = express.Router();
const { authAdmin, authCustomer, logoutUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/admin', authAdmin);
router.post('/customer', authCustomer);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
