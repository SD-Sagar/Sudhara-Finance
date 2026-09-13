const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    submitRegistration,
    getPendingRegistrations,
    approveRegistration,
    rejectRegistration
} = require('../controllers/registrationController');

router.post(
    '/',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'aadhaarDoc', maxCount: 1 },
        { name: 'voterIdDoc', maxCount: 1 },
        { name: 'panDoc', maxCount: 1 }
    ]),
    submitRegistration
);

router.get('/pending', protect, admin, getPendingRegistrations);
router.put('/:id/approve', protect, admin, approveRegistration);
router.put('/:id/reject', protect, admin, rejectRegistration);

module.exports = router;
