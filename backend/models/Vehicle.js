const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ['BIKE', 'CAR', 'SUV', 'EV'], required: true },
    brand: { type: String },
    model: { type: String },
    color: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
