const mongoose = require('mongoose');

const registrationRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    whatsappNumber: { type: String, required: true, match: /^\d{10}$/ },
    mobileNumber: { type: String, required: true, match: /^\d{10}$/ },
    email: { type: String, match: /^\S+@\S+\.\S+$/ },
    emailHash: { type: String },
    aadhaar: { type: String, required: true, match: /^\d{12}$/ },
    aadhaarHash: { type: String, required: true },
    voterId: { type: String, required: false },
    pan: { type: String, required: true, match: /^[A-Za-z0-9]{10}$/ },
    panHash: { type: String, required: true },
    photoUrl: { type: String, required: true },
    aadhaarDocUrl: { type: String, required: true },
    voterIdDocUrl: { type: String, required: false },
    panDocUrl: { type: String, required: true },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'], required: true },
    permanentAddress: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

const mongooseFieldEncryption = require('mongoose-field-encryption').fieldEncryption;
registrationRequestSchema.plugin(mongooseFieldEncryption, {
    fields: ['aadhaar', 'pan', 'voterId', 'mobileNumber', 'whatsappNumber', 'email', 'permanentAddress'],
    secret: process.env.ENCRYPTION_KEY || 'sudhara_secret_encryption_key_change_in_prod'
});

registrationRequestSchema.pre('validate', function(next) {
    const crypto = require('crypto');
    if (this.isModified('email') && this.email) {
        this.emailHash = crypto.createHash('sha256').update(this.email.toLowerCase()).digest('hex');
    }
    if (this.isModified('aadhaar') && this.aadhaar) {
        this.aadhaarHash = crypto.createHash('sha256').update(this.aadhaar).digest('hex');
    }
    if (this.isModified('pan') && this.pan) {
        this.panHash = crypto.createHash('sha256').update(this.pan.toUpperCase()).digest('hex');
    }
    next();
});

const RegistrationRequest = mongoose.model('RegistrationRequest', registrationRequestSchema);
module.exports = RegistrationRequest;
