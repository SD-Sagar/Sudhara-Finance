const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllCustomers,
    getCustomerById,
    addCustomerDirectly,
    deleteCustomer,
    activateCustomer
} = require('../controllers/customerController');

router.route('/')
    .get(protect, admin, getAllCustomers)
    .post(protect, admin, upload.fields([{ name: 'photo', maxCount: 1 }]), addCustomerDirectly);

router.route('/:id')
    .get(protect, admin, getCustomerById)
    .delete(protect, admin, deleteCustomer);

router.put('/:id/activate', protect, admin, activateCustomer);

module.exports = router;
