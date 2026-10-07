const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    totalFloors: { type: Number, default: 0 },
    totalSlots: { type: Number, default: 0 },
    openingTime: { type: String, default: "00:00" },
    closingTime: { type: String, default: "23:59" }
}, { timestamps: true });

module.exports = mongoose.model('Parking', parkingSchema);
