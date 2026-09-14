const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    requestedAmount: { type: Number, required: true },
    reason: { type: String, required: true },
    requestedDuration: { type: String, required: true }, // e.g. "6 months", "24 weeks"
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    cancellationRequested: { type: Boolean, default: false }
}, { timestamps: true });

const LoanRequest = mongoose.model('LoanRequest', loanRequestSchema);
module.exports = LoanRequest;
