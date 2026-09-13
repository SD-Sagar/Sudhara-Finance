const express = require('express');
const router = express.Router();
const { protect, admin, customer } = require('../middleware/authMiddleware');
const {
    requestLoan,
    getLoanRequests,
    approveLoan,
    getMyLoans,
    getLoanDetails
} = require('../controllers/loanController');

router.post('/request', protect, customer, requestLoan);
router.get('/requests', protect, admin, getLoanRequests);
router.post('/approve/:id', protect, admin, approveLoan);
router.get('/myloans', protect, customer, getMyLoans);
router.get('/:id', protect, getLoanDetails);

module.exports = router;
