const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    paymentDate: { type: Date },
    fine: { type: Number, default: 0 },
    penaltyAppliedDays: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'Online'], default: null },
    verifiedBy: { type: String } // Admin who verified (e.g. 'admin')
}, { timestamps: true });

const Installment = mongoose.model('Installment', installmentSchema);
module.exports = Installment;
