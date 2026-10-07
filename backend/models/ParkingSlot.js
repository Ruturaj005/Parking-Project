const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
    slotNumber: { type: String, required: true },
    slotType: { type: String, enum: ['BIKE', 'CAR', 'SUV', 'EV'], required: true },
    status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'], default: 'AVAILABLE' },
    distanceFromEntrance: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
