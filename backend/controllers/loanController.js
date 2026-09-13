const LoanRequest = require('../models/LoanRequest');
const Loan = require('../models/Loan');
const Installment = require('../models/Installment');
const sendEmail = require('../utils/sendEmail');

// @desc    Request a loan
// @route   POST /api/loans/request
// @access  Private/Customer
const requestLoan = async (req, res, next) => {
    try {
        const { requestedAmount, reason, requestedDuration } = req.body;

        // Check if customer has active loan
        const activeLoan = await Loan.findOne({ customer: req.user._id, status: 'ACTIVE' });
        if (activeLoan) {
            res.status(400);
            return next(new Error('You already have an active loan. Please clear it first.'));
        }

        // Check if customer has pending loan request
        const pendingRequest = await LoanRequest.findOne({ customer: req.user._id, status: 'PENDING' });
        if (pendingRequest) {
            res.status(400);
            return next(new Error('You already have a pending loan request.'));
        }

        const loanRequest = await LoanRequest.create({
            customer: req.user._id,
            requestedAmount,
            reason,
            requestedDuration
        });

        // Email notification to customer
        await sendEmail({
            email: req.user.email,
            subject: 'Sudhara Finance - Loan Request Received',
            message: `Dear ${req.user.name}, your loan request for ${requestedAmount} has been received. You will be notified once it is processed.`
        });

        // Email notification to admin
        await sendEmail({
            email: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: 'Sudhara Finance - New Loan Request',
            message: `A new loan request for ₹${requestedAmount} has been submitted by ${req.user.name} (${req.user.customerId}). Please review in the Admin Dashboard.`
        });

        res.status(201).json({ message: 'Loan request submitted successfully', loanRequest });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending loan requests
// @route   GET /api/loans/requests
// @access  Private/Admin
const getLoanRequests = async (req, res, next) => {
    try {
        const requests = await LoanRequest.find({ status: 'PENDING' }).populate('customer', 'name customerId email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve loan request
// @route   POST /api/loans/approve/:id
// @access  Private/Admin
const approveLoan = async (req, res, next) => {
    try {
        const { approvedAmount, duration, installmentAmount, installmentFrequency, startDate, completionDate } = req.body;
        
        const loanRequest = await LoanRequest.findById(req.params.id).populate('customer');
        if (!loanRequest) {
            res.status(404);
            return next(new Error('Loan request not found'));
        }

        if (loanRequest.status !== 'PENDING') {
            res.status(400);
            return next(new Error(`Loan request is already ${loanRequest.status}`));
        }

        // Calculate total installments based on duration and frequency
        let totalInstallments = 0;
        let incrementUnit = 'months';
        let incrementValue = 1;

        if (installmentFrequency === 'Monthly') {
            totalInstallments = parseInt(duration.split(' ')[0]); // "6 months" -> 6
            incrementUnit = 'months';
        } else if (installmentFrequency === 'Weekly') {
            totalInstallments = parseInt(duration.split(' ')[0]); // "24 weeks" -> 24
            incrementUnit = 'weeks';
        }

        const loan = await Loan.create({
            customer: loanRequest.customer._id,
            loanRequest: loanRequest._id,
            approvedAmount,
            duration,
            startDate,
            completionDate,
            installmentAmount,
            totalInstallments
        });

        loanRequest.status = 'APPROVED';
        await loanRequest.save();

        // Generate Installments
        const installments = [];
        let currentDate = new Date(startDate);
        
        for (let i = 0; i < totalInstallments; i++) {
            let dueDate = new Date(currentDate);
            
            installments.push({
                loan: loan._id,
                customer: loanRequest.customer._id,
                amount: installmentAmount,
                dueDate: dueDate
            });

            // increment date
            if (incrementUnit === 'months') {
                currentDate.setMonth(currentDate.getMonth() + incrementValue);
            } else if (incrementUnit === 'weeks') {
                currentDate.setDate(currentDate.getDate() + (7 * incrementValue));
            }
        }

        await Installment.insertMany(installments);

        // Notify customer
        await sendEmail({
            email: loanRequest.customer.email,
            subject: 'Sudhara Finance - Loan Approved',
            message: `Dear ${loanRequest.customer.name}, your loan request has been approved for amount ${approvedAmount}. Check your dashboard for the installment schedule.`
        });

        res.json({ message: 'Loan approved and installments generated', loan });
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer's own loans
// @route   GET /api/loans/myloans
// @access  Private/Customer
const getMyLoans = async (req, res, next) => {
    try {
        const loans = await Loan.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get loan details with installments
// @route   GET /api/loans/:id
// @access  Private
const getLoanDetails = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('customer', 'name customerId');
        if (!loan) {
            res.status(404);
            return next(new Error('Loan not found'));
        }

        // Authorization check
        if (req.userRole === 'CUSTOMER' && loan.customer._id.toString() !== req.user._id.toString()) {
            res.status(403);
            return next(new Error('Not authorized to view this loan'));
        }

        const installments = await Installment.find({ loan: loan._id }).sort({ dueDate: 1 });

        res.json({ loan, installments });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestLoan,
    getLoanRequests,
    approveLoan,
    getMyLoans,
    getLoanDetails
};
