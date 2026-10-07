const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'SIMULATED' },
    transactionId: { type: String },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
