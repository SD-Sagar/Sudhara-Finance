const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const bcrypt = require('bcryptjs');

// Helper
const generateUniqueId = async () => {
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        uniqueId = `SH-${randomNum}`;
        const existing = await Customer.findOne({ customerId: uniqueId });
        if (!existing) {
            isUnique = true;
        }
    }
    return uniqueId;
};

const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
const getAllCustomers = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { customerId: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const customers = await Customer.find(query).select('-password');
        res.json(customers);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single customer profile (including loans)
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id).select('-password');
        if (!customer) {
            res.status(404);
            return next(new Error('Customer not found'));
        }

        const loans = await Loan.find({ customer: customer._id }).sort({ createdAt: -1 });
        
        res.json({ customer, loans });
    } catch (error) {
        next(error);
    }
};

// @desc    Add customer directly
// @route   POST /api/customers
// @access  Private/Admin
const addCustomerDirectly = async (req, res, next) => {
    try {
        const {
            name, whatsappNumber, mobileNumber, email,
            aadhaar, voterId, pan, maritalStatus, permanentAddress, password
        } = req.body;

        const conflictQuery = [{ aadhaar }, { pan }];
        if (email) conflictQuery.push({ email });

        const existingCustomer = await Customer.findOne({
            $or: conflictQuery
        });
        if (existingCustomer) {
            res.status(400);
            return next(new Error('Customer already exists with this email, Aadhaar, or PAN'));
        }

        let photoUrl = '';
        let aadhaarDocUrl = '';
        let voterIdDocUrl = '';
        let panDocUrl = '';
        
        const { uploadToCloudinary } = require('../utils/cloudinary');

        if (req.files && req.files.photo && req.files.photo[0]) {
            photoUrl = await uploadToCloudinary(req.files.photo[0].buffer, 'sudhara/photos', req.files.photo[0].originalname);
        } else {
             res.status(400);
             return next(new Error('Photograph is required'));
        }

        if (req.files && req.files.aadhaarDoc && req.files.aadhaarDoc[0]) {
            aadhaarDocUrl = await uploadToCloudinary(req.files.aadhaarDoc[0].buffer, 'sudhara/documents', req.files.aadhaarDoc[0].originalname);
        }
        if (req.files && req.files.voterIdDoc && req.files.voterIdDoc[0]) {
            voterIdDocUrl = await uploadToCloudinary(req.files.voterIdDoc[0].buffer, 'sudhara/documents', req.files.voterIdDoc[0].originalname);
        }
        if (req.files && req.files.panDoc && req.files.panDoc[0]) {
            panDocUrl = await uploadToCloudinary(req.files.panDoc[0].buffer, 'sudhara/documents', req.files.panDoc[0].originalname);
        }

        const customerId = await generateUniqueId();
        const plainPassword = req.body.password;

        if (!plainPassword) {
             res.status(400);
             return next(new Error('Password is required'));
        }

        const customer = await Customer.create({
            customerId,
            name, bankAccountNumber, whatsappNumber, mobileNumber, email,
            aadhaar, voterId, pan, maritalStatus, permanentAddress,
            photoUrl, aadhaarDocUrl, voterIdDocUrl, panDocUrl,
            password: plainPassword,
            plainPassword: plainPassword
        });

        // Send Email
        // const sendEmail = require('../utils/sendEmail');
        const sendEmail = async () => {}; // NODEMAILER DISABLED AS REQUESTED
        const emailMessage = `
            Dear ${customer.name},

            Your account has been created by the Administrator.
            
            Customer ID: ${customer.customerId}
            Password: ${plainPassword}
            
            Please login at ${process.env.FRONTEND_URL}
        `;
        
        await sendEmail({
            email: customer.email,
            subject: 'Shudhara Women Development Organization - Account Created',
            message: emailMessage
        });

        res.status(201).json({ message: 'Customer created successfully', customerId: customer.customerId });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete (soft delete) customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            res.status(404);
            return next(new Error('Customer not found'));
        }
        
        // Soft delete
        customer.status = 'INACTIVE';
        await customer.save();

        res.json({ message: 'Customer account deactivated' });
    } catch (error) {
        next(error);
    }
};

const activateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            res.status(404);
            return next(new Error('Customer not found'));
        }
        
        customer.status = 'ACTIVE';
        await customer.save();

        res.json({ message: 'Customer account activated' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update customer details (including docs)
// @route   PUT /api/customers/:id
// @access  Private/Admin
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            res.status(404);
            return next(new Error('Customer not found'));
        }

        const {
            name, whatsappNumber, mobileNumber, email,
            aadhaar, voterId, pan, maritalStatus, permanentAddress
        } = req.body;

        // Update text fields
        if (name) customer.name = name;
        if (whatsappNumber) customer.whatsappNumber = whatsappNumber;
        if (mobileNumber) customer.mobileNumber = mobileNumber;
        if (email) customer.email = email;
        if (aadhaar) customer.aadhaar = aadhaar;
        if (voterId) customer.voterId = voterId;
        if (pan) customer.pan = pan;
        if (maritalStatus) customer.maritalStatus = maritalStatus;
        if (permanentAddress) customer.permanentAddress = permanentAddress;

        // Handle optional file uploads
        const { uploadToCloudinary } = require('../utils/cloudinary');
        if (req.files && req.files.photo && req.files.photo[0]) {
            customer.photoUrl = await uploadToCloudinary(req.files.photo[0].buffer, 'sudhara/photos', req.files.photo[0].originalname);
        }
        if (req.files && req.files.aadhaarDoc && req.files.aadhaarDoc[0]) {
            customer.aadhaarDocUrl = await uploadToCloudinary(req.files.aadhaarDoc[0].buffer, 'sudhara/documents', req.files.aadhaarDoc[0].originalname);
        }
        if (req.files && req.files.voterIdDoc && req.files.voterIdDoc[0]) {
            customer.voterIdDocUrl = await uploadToCloudinary(req.files.voterIdDoc[0].buffer, 'sudhara/documents', req.files.voterIdDoc[0].originalname);
        }
        if (req.files && req.files.panDoc && req.files.panDoc[0]) {
            customer.panDocUrl = await uploadToCloudinary(req.files.panDoc[0].buffer, 'sudhara/documents', req.files.panDoc[0].originalname);
        }

        await customer.save();
        res.json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    addCustomerDirectly,
    deleteCustomer,
    activateCustomer,
    updateCustomer
};
