const mongoose = require('mongoose');

const registrationRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    email: { type: String, required: true },
    aadhaar: { type: String, required: true },
    voterId: { type: String, required: true },
    pan: { type: String, required: true },
    photoUrl: { type: String, required: true },
    aadhaarDocUrl: { type: String }, // Optional depending on strictness
    voterIdDocUrl: { type: String },
    panDocUrl: { type: String },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'], required: true },
    permanentAddress: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

const RegistrationRequest = mongoose.model('RegistrationRequest', registrationRequestSchema);
module.exports = RegistrationRequest;
