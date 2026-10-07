const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const createPayment = async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!booking.amount) {
            return res.status(400).json({ success: false, message: 'Amount not calculated yet' });
        }
        
        if (booking.paymentStatus === 'PAID') {
            return res.status(400).json({ success: false, message: 'Already paid' });
        }

        const payment = await Payment.create({
            bookingId: booking._id,
            userId: req.user._id,
            amount: booking.amount,
            status: 'PENDING'
        });

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

const paymentSuccess = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        
        payment.status = 'PAID';
        payment.paidAt = new Date();
        payment.transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'PAID';
            await booking.save();
        }

        res.json({ success: true, message: 'Payment successful', data: payment });
    } catch (error) {
        next(error);
    }
};

const paymentFail = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        
        payment.status = 'FAILED';
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'FAILED';
            await booking.save();
        }

        res.json({ success: true, message: 'Payment failed', data: payment });
    } catch (error) {
        next(error);
    }
};

module.exports = { createPayment, paymentSuccess, paymentFail };
