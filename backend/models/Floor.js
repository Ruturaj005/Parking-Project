const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
    parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    floorNumber: { type: Number, required: true },
    name: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Floor', floorSchema);
