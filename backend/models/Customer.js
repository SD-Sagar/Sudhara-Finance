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
    email: { type: String, match: /^\S+@\S+\.\S+$/, unique: true, sparse: true },
    aadhaar: { type: String, required: true, match: /^\d{12}$/ },
    voterId: { type: String, required: false },
    pan: { type: String, required: true, match: /^[A-Za-z0-9]{10}$/ },
    photoUrl: { type: String, required: true },
    aadhaarDocUrl: { type: String, required: true },
    voterIdDocUrl: { type: String, required: false },
    panDocUrl: { type: String, required: true },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'], required: true },
    permanentAddress: { type: String, required: true },
    password: { type: String, required: true },
    plainPassword: { type: String }, // For admin to view prototype credentials
    role: { type: String, enum: ['CUSTOMER'], default: 'CUSTOMER' },
    cibilScore: { type: Number, default: 600, min: 150, max: 800 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

customerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
