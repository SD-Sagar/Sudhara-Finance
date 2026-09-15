const mongoose = require('mongoose');

const registrationRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    whatsappNumber: { type: String, required: true, match: /^\d{10}$/ },
    mobileNumber: { type: String, required: true, match: /^\d{10}$/ },
    email: { type: String, match: /^\S+@\S+\.\S+$/ },
    aadhaar: { type: String, required: true, match: /^\d{12}$/ },
    voterId: { type: String, required: false },
    pan: { type: String, required: true, match: /^[A-Za-z0-9]{10}$/ },
    photoUrl: { type: String, required: true },
    aadhaarDocUrl: { type: String, required: true },
    voterIdDocUrl: { type: String, required: false },
    panDocUrl: { type: String, required: true },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'], required: true },
    permanentAddress: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

const RegistrationRequest = mongoose.model('RegistrationRequest', registrationRequestSchema);
module.exports = RegistrationRequest;
