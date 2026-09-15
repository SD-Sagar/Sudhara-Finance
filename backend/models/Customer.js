const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String, // format: SH-XXXX
        required: true,
        unique: true
    },
    name: { type: String, required: true },
    whatsappNumber: { type: String, required: true, match: /^\d{10}$/ },
    mobileNumber: { type: String, required: true, match: /^\d{10}$/ },
    email: { type: String, match: /^\S+@\S+\.\S+$/, sparse: true },
    emailHash: { type: String, unique: true, sparse: true },
    aadhaar: { type: String, required: true, match: /^\d{12}$/ },
    aadhaarHash: { type: String, required: true },
    voterId: { type: String, required: false },
    pan: { type: String, required: true, match: /^[A-Za-z0-9]{10}$/ },
    panHash: { type: String, required: true },
    photoUrl: { type: String, required: false },
    aadhaarDocUrl: { type: String, required: false },
    voterIdDocUrl: { type: String, required: false },
    panDocUrl: { type: String, required: false },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'], required: true },
    permanentAddress: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER'], default: 'CUSTOMER' },
    cibilScore: { type: Number, default: 600, min: 150, max: 800 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

customerSchema.pre('validate', function(next) {
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

customerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

customerSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const mongooseFieldEncryption = require('mongoose-field-encryption').fieldEncryption;
customerSchema.plugin(mongooseFieldEncryption, {
    fields: ['aadhaar', 'pan', 'voterId', 'mobileNumber', 'whatsappNumber', 'email', 'permanentAddress'],
    secret: process.env.ENCRYPTION_KEY || 'sudhara_secret_encryption_key_change_in_prod'
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
