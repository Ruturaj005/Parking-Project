const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleDetails: { 
        vehicleNumber: String,
        vehicleType: String,
        brand: String,
        model: String
    },
    parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
    bookingTime: { type: Date, default: Date.now },
    scheduledEntryTime: { type: Date, required: true },
    entryTime: { type: Date },
    exitTime: { type: Date },
    duration: { type: Number }, // in minutes
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'CONFIRMED' },
    amount: { type: Number },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    qrCode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
