const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const addVehicle = async (req, res, next) => {
    try {
        const { vehicleNumber, vehicleType, brand, model, color } = req.body;
        if (!vehicleNumber || !vehicleType) {
            return res.status(400).json({ success: false, message: 'Vehicle number and type are required' });
        }

        const vehicleExists = await Vehicle.findOne({ vehicleNumber });
        if (vehicleExists) {
            return res.status(400).json({ success: false, message: 'Vehicle number already registered' });
        }

        const vehicle = await Vehicle.create({
            userId: req.user._id,
            vehicleNumber,
            vehicleType,
            brand,
            model,
            color
        });

        res.status(201).json({ success: true, message: 'Vehicle added successfully', data: vehicle });
    } catch (error) {
        next(error);
    }
};

const getVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user._id });
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
};

const getVehicleById = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, userId: req.user._id });
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
};

const updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.json({ success: true, message: 'Vehicle updated', data: vehicle });
    } catch (error) {
        next(error);
    }
};

const deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, userId: req.user._id });
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Check active bookings
        const activeBooking = await Booking.findOne({
            vehicleId: vehicle._id,
            status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
        });

        if (activeBooking) {
            return res.status(400).json({ success: false, message: 'Cannot delete vehicle with active booking' });
        }

        await vehicle.deleteOne();
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };
