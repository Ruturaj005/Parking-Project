const Parking = require('../models/Parking');
const Floor = require('../models/Floor');
const ParkingSlot = require('../models/ParkingSlot');

const getAllParking = async (req, res, next) => {
    try {
        const parkings = await Parking.find();
        res.json({ success: true, data: parkings });
    } catch (error) {
        next(error);
    }
};

const getParkingById = async (req, res, next) => {
    try {
        const parking = await Parking.findById(req.params.id);
        if (!parking) return res.status(404).json({ success: false, message: 'Parking not found' });
        
        const floors = await Floor.find({ parkingId: parking._id });
        const slots = await ParkingSlot.find({ parkingId: parking._id });
        
        res.json({ success: true, data: { parking, floors, slots } });
    } catch (error) {
        next(error);
    }
};

const getAvailableSlots = async (req, res, next) => {
    try {
        const slots = await ParkingSlot.find({ parkingId: req.params.id, status: 'AVAILABLE' });
        res.json({ success: true, data: slots, count: slots.length });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllParking, getParkingById, getAvailableSlots };
