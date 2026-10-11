const Installment = require('../models/Installment');
const Loan = require('../models/Loan');
// const sendEmail = require('../utils/sendEmail');
const sendEmail = async () => {}; // NODEMAILER DISABLED AS REQUESTED

// @desc    Mark installment as paid
// @route   PUT /api/installments/:id/pay
// @access  Private/Admin
const markInstallmentPaid = async (req, res, next) => {
    try {
        const { paymentMethod, paymentDate } = req.body; // 'Cash' or 'Online'

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
        installment.paymentDate = paymentDate ? new Date(paymentDate) : Date.now();
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
            subject: 'Shudhara Women Development Organization - Payment Received',
            message: `Dear ${installment.customer.name}, your payment of ${installment.amount} for the installment due on ${new Date(installment.dueDate).toLocaleDateString('en-GB')} has been successfully recorded.`
        });

        res.json({ message: 'Installment marked as paid', installment, loan });
    } catch (error) {
        next(error);
    }
};

// Helper: Check and apply overdue fines & CIBIL deductions automatically
const applyOverdueFinesAndCibil = async () => {
    try {
        const currentDate = new Date();
        
        // Find all pending or overdue installments where due date has passed
        const overdueInstallments = await Installment.find({
            status: { $in: ['PENDING', 'OVERDUE'] },
            dueDate: { $lt: currentDate }
        }).populate('customer').populate('loan');

        let updatedCount = 0;

        for (const installment of overdueInstallments) {
            let hasChanges = false;
            
            // Determine cycle in days (default to 30 for Monthly, 7 for Weekly)
            const isWeekly = installment.loan?.duration?.toLowerCase().includes('week');
            const cycleDays = isWeekly ? 7 : 30;

            const timeDiff = currentDate.getTime() - new Date(installment.dueDate).getTime();
            const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            if (daysOverdue >= 0) {
                // cyclesOverdue: 0 to (cycleDays-1) = 1 cycle, etc.
                const cyclesOverdue = Math.floor(daysOverdue / cycleDays) + 1;
                const currentPenaltyCycles = installment.penaltyAppliedDays || 0;
                
                if (cyclesOverdue > currentPenaltyCycles) {
                    const cyclesToApply = cyclesOverdue - currentPenaltyCycles;
                    installment.penaltyAppliedDays = cyclesOverdue;
                    
                    installment.status = 'OVERDUE';
                    installment.fine = (installment.fine || 0) + (10 * cyclesToApply); // ₹10 per overdue cycle
                    hasChanges = true;
                    
                    // Deduct 10 CIBIL points per overdue cycle (min 150)
                    if (installment.customer) {
                        const currentScore = installment.customer.cibilScore || 600;
                        installment.customer.cibilScore = Math.max(150, currentScore - (10 * cyclesToApply));
                        await installment.customer.save();
                    }
                }
            }

            if (hasChanges) {
                await installment.save();
                updatedCount++;
            }
        }

        return updatedCount;
    } catch (err) {
        console.error('Error applying overdue fines:', err);
        return 0;
    }
};

// @desc    Check and update overdue installments (Can be called via cron job, or manually by admin)
// @route   POST /api/installments/check-overdue
// @access  Private/Admin
const checkOverdueInstallments = async (req, res, next) => {
    try {
        const updatedCount = await applyOverdueFinesAndCibil();
        res.json({ message: `Checked overdue installments. Updated: ${updatedCount}` });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk mark installments as paid
// @route   PUT /api/installments/bulk-pay
// @access  Private/Admin
const bulkMarkInstallmentsPaid = async (req, res, next) => {
    try {
        const { installmentIds, paymentMethod, paymentDate } = req.body;
        
        if (!installmentIds || installmentIds.length === 0) {
            res.status(400);
            return next(new Error('No installments selected'));
        }

        const dateToApply = paymentDate ? new Date(paymentDate) : Date.now();
        const installments = await Installment.find({ _id: { $in: installmentIds } }).populate('loan').populate('customer');
        
        let customerToUpdate = null;
        let cibilIncrease = 0;
        let loanIds = new Set();
        let loanCompletedIncrements = {};

        for (let installment of installments) {
            if (installment.status === 'PAID') continue; // Skip already paid ones to maintain app consistency
            
            installment.status = 'PAID';
            installment.paymentDate = dateToApply;
            installment.paymentMethod = paymentMethod;
            installment.verifiedBy = req.user._id;

            const isPaidOnTime = new Date(installment.paymentDate) <= new Date(installment.dueDate);
            if (isPaidOnTime) {
                cibilIncrease += 5;
            }

            customerToUpdate = installment.customer;
            loanIds.add(installment.loan._id.toString());
            loanCompletedIncrements[installment.loan._id] = (loanCompletedIncrements[installment.loan._id] || 0) + 1;

            await installment.save();
        }

        if (customerToUpdate && cibilIncrease > 0) {
            const currentScore = customerToUpdate.cibilScore || 600;
            customerToUpdate.cibilScore = Math.min(800, currentScore + cibilIncrease);
            await customerToUpdate.save();
        }

        for (let loanId of loanIds) {
            const loan = await Loan.findById(loanId);
            loan.completedInstallments += loanCompletedIncrements[loanId];
            if (loan.completedInstallments >= loan.totalInstallments) {
                loan.status = 'COMPLETED';
            }
            await loan.save();
        }

        res.json({ message: `${installments.length} installments marked as paid successfully` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markInstallmentPaid,
    checkOverdueInstallments,
    applyOverdueFinesAndCibil,
    bulkMarkInstallmentsPaid
};
