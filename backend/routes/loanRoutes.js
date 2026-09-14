const express = require('express');
const router = express.Router();
const { protect, admin, customer } = require('../middleware/authMiddleware');
const {
    requestLoan,
    getLoanRequests,
    approveLoan,
    getMyLoans,
    getLoanDetails,
    getMyLoanRequests,
    requestCancellation,
    resolveCancellation,
    deleteLoan
} = require('../controllers/loanController');

router.post('/request', protect, customer, requestLoan);
router.get('/requests', protect, admin, getLoanRequests);
router.post('/approve/:id', protect, admin, approveLoan);
router.get('/myloans', protect, customer, getMyLoans);
router.get('/my-requests', protect, customer, getMyLoanRequests);
router.post('/request/:id/cancel-request', protect, customer, requestCancellation);
router.post('/request/:id/cancel-resolve', protect, admin, resolveCancellation);
router.get('/:id', protect, getLoanDetails);
router.delete('/:id', protect, admin, deleteLoan);

module.exports = router;
