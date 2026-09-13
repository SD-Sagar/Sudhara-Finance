const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    loanRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanRequest', required: true },
    approvedAmount: { type: Number, required: true },
    duration: { type: String, required: true }, // e.g. "6 months"
    startDate: { type: Date, required: true },
    completionDate: { type: Date, required: true },
    installmentAmount: { type: Number, required: true },
    totalInstallments: { type: Number, required: true },
    completedInstallments: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' }
}, { timestamps: true });

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
