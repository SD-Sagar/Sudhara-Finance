const Installment = require('../models/Installment');
const Loan = require('../models/Loan');
const sendEmail = require('../utils/sendEmail');

// @desc    Mark installment as paid
// @route   PUT /api/installments/:id/pay
// @access  Private/Admin
const markInstallmentPaid = async (req, res, next) => {
    try {
        const { paymentMethod } = req.body; // 'Cash' or 'Online'

        const installment = await Installment.findById(req.params.id).populate('loan').populate('customer');
        
        if (!installment) {
            res.status(404);
            return next(new Error('Installment not found'));
        }

        if (installment.status === 'PAID') {
            res.status(400);
            return next(new Error('Installment is already paid'));
        }

        installment.status = 'PAID';
        installment.paymentDate = Date.now();
        installment.paymentMethod = paymentMethod;
        installment.verifiedBy = req.user._id;

        await installment.save();

        // Update Loan
        const loan = await Loan.findById(installment.loan._id);
        loan.completedInstallments += 1;

        if (loan.completedInstallments === loan.totalInstallments) {
            loan.status = 'COMPLETED';
        }

        await loan.save();

        // Notify customer
        await sendEmail({
            email: installment.customer.email,
            subject: 'Sudhara Finance - Payment Received',
            message: `Dear ${installment.customer.name}, your payment of ${installment.amount} for the installment due on ${new Date(installment.dueDate).toLocaleDateString()} has been successfully recorded.`
        });

        res.json({ message: 'Installment marked as paid', installment, loan });
    } catch (error) {
        next(error);
    }
};

// @desc    Check and update overdue installments (Can be called via cron job, or manually by admin for prototype)
// @route   POST /api/installments/check-overdue
// @access  Private/Admin
const checkOverdueInstallments = async (req, res, next) => {
    try {
        const currentDate = new Date();
        
        // Find all pending installments where due date has passed
        const overdueInstallments = await Installment.find({
            status: 'PENDING',
            dueDate: { $lt: currentDate }
        });

        let updatedCount = 0;

        for (const installment of overdueInstallments) {
            installment.status = 'OVERDUE';
            installment.fine += 10; // Apply ₹10 fine
            await installment.save();
            updatedCount++;

            // Optional: send overdue notification
            /*
            await sendEmail({ ... })
            */
        }

        res.json({ message: `Checked overdue installments. Updated: ${updatedCount}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markInstallmentPaid,
    checkOverdueInstallments
};
