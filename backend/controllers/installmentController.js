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

        // CIBIL Score Logic (Paid on time or early)
        const isPaidOnTime = new Date(installment.paymentDate) <= new Date(installment.dueDate);
        if (isPaidOnTime) {
            const currentScore = installment.customer.cibilScore || 600;
            installment.customer.cibilScore = Math.min(800, currentScore + 5);
            await installment.customer.save();
        }

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
        
        // Find all pending or overdue installments where due date has passed
        const overdueInstallments = await Installment.find({
            status: { $in: ['PENDING', 'OVERDUE'] },
            dueDate: { $lt: currentDate }
        }).populate('customer');

        let updatedCount = 0;

        for (const installment of overdueInstallments) {
            let hasChanges = false;
            
            // Mark as overdue and apply one-time fine if it was PENDING
            if (installment.status === 'PENDING') {
                installment.status = 'OVERDUE';
                installment.fine += 10; // Apply ₹10 fine once
                hasChanges = true;
            }

            // Calculate daily CIBIL penalty
            const timeDiff = currentDate.getTime() - new Date(installment.dueDate).getTime();
            const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            const currentPenaltyDays = installment.penaltyAppliedDays || 0;
            if (daysOverdue > currentPenaltyDays) {
                const penaltyDaysToApply = daysOverdue - currentPenaltyDays;
                installment.penaltyAppliedDays = daysOverdue;
                hasChanges = true;
                
                // Deduct 5 points per overdue day
                if (installment.customer) {
                    const currentScore = installment.customer.cibilScore || 600;
                    installment.customer.cibilScore = Math.max(150, currentScore - (5 * penaltyDaysToApply));
                    await installment.customer.save();
                }
            }

            if (hasChanges) {
                await installment.save();
                updatedCount++;
            }
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
