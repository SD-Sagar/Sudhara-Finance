const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be Customer or Admin
    userModel: { type: String, required: true, enum: ['User', 'Customer'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['EMAIL', 'WHATSAPP', 'SYSTEM'], default: 'SYSTEM' },
    status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
