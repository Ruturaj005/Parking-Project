const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Parking = require('../models/Parking');
const Floor = require('../models/Floor');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

const getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'USER' });
        const totalVehicles = await Vehicle.countDocuments();
        const totalParkings = await Parking.countDocuments();
        
        const slots = await ParkingSlot.find();
        const totalSlots = slots.length;
        const availableSlots = slots.filter(s => s.status === 'AVAILABLE').length;
        const occupiedSlots = slots.filter(s => s.status === 'OCCUPIED').length;
        const reservedSlots = slots.filter(s => s.status === 'RESERVED').length;
        const maintenanceSlots = slots.filter(s => s.status === 'MAINTENANCE').length;
        
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);
        
        const todaysBookings = await Booking.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        
        const completedBookings = await Booking.find({ status: 'COMPLETED' });
        const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        const todaysRevenue = todaysBookings
            .filter(b => b.status === 'COMPLETED')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const occupancyPercentage = (totalSlots - maintenanceSlots) > 0 ? ((occupiedSlots + reservedSlots) / (totalSlots - maintenanceSlots)) * 100 : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalVehicles,
                totalParkings,
                totalSlots,
                availableSlots,
                occupiedSlots,
                reservedSlots,
                maintenanceSlots,
                todaysBookings: todaysBookings.length,
                totalRevenue,
                todaysRevenue,
                occupancyPercentage: occupancyPercentage.toFixed(2)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'USER' }).select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

const getAllVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find().populate('userId', 'name email');
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
};

const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('vehicleId', 'vehicleNumber vehicleType')
            .populate('parkingId', 'name')
            .populate('slotId', 'slotNumber status');
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        
        const dailyRevenue = [];
        for (const dateStr of last7Days) {
            const start = new Date(dateStr);
            const end = new Date(dateStr);
            end.setHours(23,59,59,999);
            const b = await Booking.find({ status: 'COMPLETED', exitTime: { $gte: start, $lte: end }});
            const rev = b.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            dailyRevenue.push({ name: dateStr, revenue: rev });
        }

        const vehicles = await Vehicle.aggregate([
            { $group: { _id: "$vehicleType", count: { $sum: 1 } } }
        ]);
        const vehicleData = vehicles.map(v => ({ name: v._id, value: v.count }));

        res.json({
            success: true,
            data: {
                dailyRevenue,
                vehicleTypes: vehicleData
            }
        });
    } catch (error) {
        next(error);
    }
};

const createParking = async (req, res, next) => {
    try {
        const parking = await Parking.create(req.body);
        res.status(201).json({ success: true, data: parking });
    } catch (error) {
        next(error);
    }
};

const createFloor = async (req, res, next) => {
    try {
        const floor = await Floor.create(req.body);
        await Parking.findByIdAndUpdate(floor.parkingId, { $inc: { totalFloors: 1 } });
        res.status(201).json({ success: true, data: floor });
    } catch (error) {
        next(error);
    }
};

const createSlot = async (req, res, next) => {
    try {
        const slot = await ParkingSlot.create(req.body);
        await Parking.findByIdAndUpdate(slot.parkingId, { $inc: { totalSlots: 1 } });
        res.status(201).json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
};

const setSlotStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        
        if (slot.status === 'OCCUPIED' && status === 'AVAILABLE') {
            const activeBooking = await Booking.findOne({ slotId: slot._id, status: 'ACTIVE' });
            if (activeBooking) {
                return res.status(400).json({ success: false, message: 'Cannot make slot available while an active booking exists' });
            }
        }
        
        slot.status = status;
        await slot.save();
        
        const io = req.app.get('io');
        if(io) io.emit('parkingSlotUpdated', { slotId: slot._id, status: slot.status, parkingId: slot.parkingId });

        res.json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats, getAllUsers, getAllVehicles, getAllBookings, getAnalytics,
    createParking, createFloor, createSlot, setSlotStatus
};
