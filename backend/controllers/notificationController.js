const RegistrationRequest = require('../models/RegistrationRequest');
const LoanRequest = require('../models/LoanRequest');
const Installment = require('../models/Installment');

// @desc    Get admin notifications (smart aggregated)
// @route   GET /api/notifications/admin
// @access  Private/Admin
const getAdminNotifications = async (req, res, next) => {
    try {
        const notifications = [];

        // 1. Pending Registrations
        const pendingRegistrations = await RegistrationRequest.countDocuments({ status: 'PENDING' });
        if (pendingRegistrations > 0) {
            notifications.push({
                id: 'notif_reg',
                type: 'registration',
                message: `${pendingRegistrations} New Customer Registration Request(s)`,
                actionTab: 'approvals'
            });
        }

        // 2. Pending Loan Requests
        const pendingLoans = await LoanRequest.countDocuments({ status: 'PENDING' });
        if (pendingLoans > 0) {
            notifications.push({
                id: 'notif_loan',
                type: 'loan',
                message: `${pendingLoans} New Loan Request(s) Pending`,
                actionTab: 'loans'
            });
        }

        // 3. Upcoming and Overdue Installments (due in <= 3 days or already overdue)
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() + 3);

        const urgentInstallments = await Installment.countDocuments({
            status: { $in: ['PENDING', 'OVERDUE'] },
            dueDate: { $lte: dateThreshold }
        });

        if (urgentInstallments > 0) {
            notifications.push({
                id: 'notif_inst',
                type: 'installment',
                message: `${urgentInstallments} Installment(s) Overdue or Due Soon`,
                actionTab: 'payments'
            });
        }

        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminNotifications
};
