const RegistrationRequest = require('../models/RegistrationRequest');
const Customer = require('../models/Customer');
const { uploadToCloudinary } = require('../utils/cloudinary');
// const sendEmail = require('../utils/sendEmail');
const sendEmail = async () => {}; // NODEMAILER DISABLED AS REQUESTED
const bcrypt = require('bcryptjs');

// @desc    Submit registration request
// @route   POST /api/registration
// @access  Public
const submitRegistration = async (req, res, next) => {
    try {
        const {
            name, bankAccountNumber, whatsappNumber, mobileNumber, email,
            aadhaar, voterId, pan, maritalStatus, permanentAddress
        } = req.body;

        // Check if customer already exists with email or aadhaar/pan
        const existingCustomer = await Customer.findOne({
            $or: [{ email }, { aadhaar }, { pan }]
        });
        if (existingCustomer) {
            res.status(400);
            return next(new Error('Customer already exists with this email, Aadhaar, or PAN'));
        }

        const existingRequest = await RegistrationRequest.findOne({
            $or: [{ email }, { aadhaar }, { pan }],
            status: 'PENDING'
        });
        if (existingRequest) {
            res.status(400);
            return next(new Error('A pending registration request already exists'));
        }

        // Upload files to Cloudinary
        let photoUrl = '';
        let aadhaarDocUrl = '';
        let voterIdDocUrl = '';
        let panDocUrl = '';

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

        const request = await RegistrationRequest.create({
            name, bankAccountNumber, whatsappNumber, mobileNumber, email,
            aadhaar, voterId, pan, maritalStatus, permanentAddress,
            photoUrl, aadhaarDocUrl, voterIdDocUrl, panDocUrl
        });

        // Notify Admin
        await sendEmail({
            email: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: 'Shudhara Women Development Organization - New Registration Request',
            text: `A new registration request has been submitted by ${name}. \n\nEmail: ${email}\nPhone: ${whatsappNumber}\n\nPlease review it in the admin dashboard.`
        });

        res.status(201).json({ message: 'Registration request submitted successfully', request });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending registrations
// @route   GET /api/registration/pending
// @access  Private/Admin
const getPendingRegistrations = async (req, res, next) => {
    try {
        const requests = await RegistrationRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Helper function to generate unique ID
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

// Helper to generate a random password
const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
};

// @desc    Approve registration request
// @route   PUT /api/registration/:id/approve
// @access  Private/Admin
const approveRegistration = async (req, res, next) => {
    try {
        const request = await RegistrationRequest.findById(req.params.id);

        if (!request) {
            res.status(404);
            return next(new Error('Request not found'));
        }

        if (request.status !== 'PENDING') {
            res.status(400);
            return next(new Error(`Request is already ${request.status}`));
        }

        const customerId = await generateUniqueId();
        const plainPassword = req.body.password;

        if (!plainPassword) {
            res.status(400);
            return next(new Error('Password must be provided to approve this registration'));
        }

        const customer = await Customer.create({
            customerId,
            name: request.name,
            bankAccountNumber: request.bankAccountNumber,
            whatsappNumber: request.whatsappNumber,
            mobileNumber: request.mobileNumber,
            email: request.email,
            aadhaar: request.aadhaar,
            voterId: request.voterId,
            pan: request.pan,
            photoUrl: request.photoUrl,
            aadhaarDocUrl: request.aadhaarDocUrl,
            voterIdDocUrl: request.voterIdDocUrl,
            panDocUrl: request.panDocUrl,
            maritalStatus: request.maritalStatus,
            permanentAddress: request.permanentAddress,
            password: plainPassword,
            plainPassword: plainPassword
        });

        request.status = 'APPROVED';
        await request.save();

        // Send Email
        await sendEmail({
            email: customer.email,
            subject: 'Shudhara Women Development Organization - Registration Approved',
            text: `Dear ${customer.name},\n\nYour registration to Shudhara Women Development Organization has been approved.\n\nYour login credentials are:\nCustomer ID: ${customer.customerId}\nEmail: ${customer.email}\nPassword: ${plainPassword}\n\nPlease login at ${process.env.FRONTEND_URL}`
        });

        res.json({ message: 'Request approved and customer created', customerId: customer.customerId });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject registration request
// @route   PUT /api/registration/:id/reject
// @access  Private/Admin
const rejectRegistration = async (req, res, next) => {
    try {
        const request = await RegistrationRequest.findById(req.params.id);

        if (!request) {
            res.status(404);
            return next(new Error('Request not found'));
        }

        if (request.status !== 'PENDING') {
            res.status(400);
            return next(new Error(`Request is already ${request.status}`));
        }

        request.status = 'REJECTED';
        await request.save();

        const emailMessage = `
            Dear ${request.name},

            We regret to inform you that your registration request to Shudhara Women Development Organization has been rejected.
            For more details, please contact our support.
        `;
        
        await sendEmail({
            email: request.email,
            subject: 'Shudhara Women Development Organization - Registration Rejected',
            message: emailMessage
        });

        res.json({ message: 'Request rejected' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitRegistration,
    getPendingRegistrations,
    approveRegistration,
    rejectRegistration
};
