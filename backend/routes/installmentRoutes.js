const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    markInstallmentPaid,
    checkOverdueInstallments,
    bulkMarkInstallmentsPaid
} = require('../controllers/installmentController');

router.put('/bulk-pay', protect, admin, bulkMarkInstallmentsPaid);
router.put('/:id/pay', protect, admin, markInstallmentPaid);
router.post('/check-overdue', protect, admin, checkOverdueInstallments);

module.exports = router;
