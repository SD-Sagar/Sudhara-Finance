const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetEntity: { type: String, required: true }, // e.g. Customer, Loan, Installment
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: Object }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
