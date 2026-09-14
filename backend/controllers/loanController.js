const LoanRequest = require('../models/LoanRequest');
const Loan = require('../models/Loan');
const Installment = require('../models/Installment');
const User = require('../models/User');
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

// @desc    Get customer's pending loan requests
// @route   GET /api/loans/my-requests
// @access  Private/Customer
const getMyLoanRequests = async (req, res, next) => {
    try {
        const requests = await LoanRequest.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Customer requests cancellation of a pending loan request
// @route   POST /api/loans/request/:id/cancel-request
// @access  Private/Customer
const requestCancellation = async (req, res, next) => {
    try {
        const loanRequest = await LoanRequest.findById(req.params.id);
        if (!loanRequest) {
            res.status(404);
            return next(new Error('Loan request not found'));
        }

        if (loanRequest.customer.toString() !== req.user._id.toString()) {
            res.status(403);
            return next(new Error('Not authorized'));
        }

        if (loanRequest.status !== 'PENDING') {
            res.status(400);
            return next(new Error('Can only cancel pending requests'));
        }

        const now = new Date();
        const createdDate = new Date(loanRequest.createdAt);
        const timeDiff = now.getTime() - createdDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);

        if (daysDiff > 2) {
            res.status(400);
            return next(new Error('Cancellation request is only allowed within 2 days of initial request.'));
        }

        loanRequest.cancellationRequested = true;
        await loanRequest.save();

        // Email notification to admin
        await sendEmail({
            email: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: 'Sudhara Finance - Loan Cancellation Requested',
            message: `Customer ${req.user.name} (${req.user.customerId}) has requested cancellation for their loan request of ₹${loanRequest.requestedAmount}. Please review in the Admin Dashboard.`
        });

        res.json({ message: 'Cancellation requested successfully', loanRequest });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin resolves a cancellation request
// @route   POST /api/loans/request/:id/cancel-resolve
// @access  Private/Admin
const resolveCancellation = async (req, res, next) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        const loanRequest = await LoanRequest.findById(req.params.id).populate('customer');
        
        if (!loanRequest) {
            res.status(404);
            return next(new Error('Loan request not found'));
        }

        if (!loanRequest.cancellationRequested) {
            res.status(400);
            return next(new Error('This request does not have a pending cancellation request.'));
        }

        if (action === 'approve') {
            loanRequest.status = 'REJECTED'; // effectively cancelled
            loanRequest.cancellationRequested = false; // resolved
            await loanRequest.save();

            await sendEmail({
                email: loanRequest.customer.email,
                subject: 'Sudhara Finance - Loan Request Cancelled',
                message: `Dear ${loanRequest.customer.name}, your request to cancel the loan for ₹${loanRequest.requestedAmount} has been approved.`
            });

            res.json({ message: 'Cancellation approved', loanRequest });
        } else if (action === 'reject') {
            loanRequest.cancellationRequested = false; // back to normal pending
            await loanRequest.save();

            await sendEmail({
                email: loanRequest.customer.email,
                subject: 'Sudhara Finance - Cancellation Request Rejected',
                message: `Dear ${loanRequest.customer.name}, your request to cancel the loan for ₹${loanRequest.requestedAmount} was rejected. Your loan request is still pending processing.`
            });

            res.json({ message: 'Cancellation rejected', loanRequest });
        } else {
            res.status(400);
            return next(new Error('Invalid action'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Admin deletes a loan history
// @route   DELETE /api/loans/:id
// @access  Private/Admin
const deleteLoan = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) {
            res.status(400);
            return next(new Error('Admin password is required to delete a loan history.'));
        }

        // Verify admin password
        const adminUser = await User.findById(req.user._id);
        if (!adminUser) {
            res.status(404);
            return next(new Error('Admin user not found.'));
        }

        const isMatch = await adminUser.matchPassword(password);
        if (!isMatch) {
            res.status(401);
            return next(new Error('Invalid admin password.'));
        }

        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            res.status(404);
            return next(new Error('Loan not found'));
        }

        // Delete all associated installments
        await Installment.deleteMany({ loan: loan._id });
        
        // Delete the loan itself
        await Loan.deleteOne({ _id: loan._id });

        res.json({ message: 'Loan history and all installments deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestLoan,
    getLoanRequests,
    approveLoan,
    getMyLoans,
    getLoanDetails,
    getMyLoanRequests,
    requestCancellation,
    resolveCancellation,
    deleteLoan
};
