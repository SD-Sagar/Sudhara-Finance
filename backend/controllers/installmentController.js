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
                // cyclesOverdue: 0-6 days (weekly) = 1, 7-13 days = 2
                const cyclesOverdue = Math.floor(daysOverdue / cycleDays) + 1;
                const currentPenaltyCycles = installment.penaltyAppliedDays || 0; // Using this field to store cycles
                
                if (cyclesOverdue > currentPenaltyCycles) {
                    const cyclesToApply = cyclesOverdue - currentPenaltyCycles;
                    installment.penaltyAppliedDays = cyclesOverdue;
                    
                    installment.status = 'OVERDUE';
                    installment.fine += (10 * cyclesToApply); // Add ₹10 fine per cycle
                    hasChanges = true;
                    
                    // Deduct 10 points per overdue cycle
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

        res.json({ message: `Checked overdue installments. Updated: ${updatedCount}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markInstallmentPaid,
    checkOverdueInstallments
};
