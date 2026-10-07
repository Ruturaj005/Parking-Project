const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const mongoose = require('mongoose');
const { findBestParkingSlot } = require('../utils/slotAllocator');
const { priceCalculator } = require('../utils/priceCalculator');
const QRCode = require('qrcode');

const createBooking = async (req, res, next) => {
    try {
        const { vehicleId, parkingId, scheduledEntryTime } = req.body;
        
        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user._id });
        if (!vehicle) throw new Error('Vehicle not found or does not belong to user');
        
        const parking = await Parking.findById(parkingId);
        if (!parking) throw new Error('Parking not found');

        const existingBooking = await Booking.findOne({
            vehicleId,
            status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
        });
        if (existingBooking) throw new Error('This vehicle already has an active or confirmed booking');

        let bestSlot = null;
        let lockedSlot = null;
        let attempts = 0;
        
        while (attempts < 3 && !lockedSlot) {
            attempts++;
            bestSlot = await findBestParkingSlot(vehicle.vehicleType, parkingId);
            if (!bestSlot) {
                throw new Error('No suitable parking slot available.');
            }

            lockedSlot = await ParkingSlot.findOneAndUpdate(
                { _id: bestSlot._id, status: 'AVAILABLE' },
                { $set: { status: 'RESERVED' } },
                { new: true }
            );
        }

        if (!lockedSlot) {
            throw new Error('System is experiencing high traffic and slots are being taken rapidly. Please try again.');
        }

        const booking = await Booking.create({
            userId: req.user._id,
            vehicleId: vehicle._id,
            vehicleDetails: {
                vehicleNumber: vehicle.vehicleNumber,
                vehicleType: vehicle.vehicleType,
                brand: vehicle.brand,
                model: vehicle.model
            },
            parkingId: parking._id,
            floorId: lockedSlot.floorId,
            slotId: lockedSlot._id,
            scheduledEntryTime: new Date(scheduledEntryTime),
            status: 'CONFIRMED'
        });

        const qrData = JSON.stringify({ bookingId: booking._id.toString(), userId: req.user._id.toString() });
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        booking.qrCode = qrCodeUrl;
        await booking.save();
        
        const io = req.app.get('io');
        if(io) io.emit('parkingSlotUpdated', { slotId: lockedSlot._id, status: 'RESERVED', parkingId });

        res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
    } catch (error) {
        // Return 400 for business logic errors instead of 500
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('vehicleId')
            .populate('parkingId')
            .populate('slotId')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicleId')
            .populate('parkingId')
            .populate('slotId');
        if(!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        // Check access
        if(booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel a booking in ${booking.status} state` });
        }

        const timeDiff = new Date(booking.scheduledEntryTime).getTime() - new Date().getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        let refundMsg = 'Refund not applicable';
        if (booking.paymentStatus === 'PAID') {
            if (minutesDiff > 30) {
                refundMsg = 'Full refund initiated';
            } else {
                refundMsg = 'Partial refund initiated per policy';
            }
        }

        booking.status = 'CANCELLED';
        await booking.save();

        const slot = await ParkingSlot.findById(booking.slotId);
        if (slot) {
            slot.status = 'AVAILABLE';
            await slot.save();
            const io = req.app.get('io');
            if(io) io.emit('parkingSlotUpdated', { slotId: slot._id, status: 'AVAILABLE', parkingId: slot.parkingId });
        }

        res.json({ success: true, message: 'Booking cancelled. ' + refundMsg, data: booking });
    } catch (error) {
        next(error);
    }
};

const entryVehicle = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
        }

        if (booking.status !== 'CONFIRMED') {
            return res.status(400).json({ success: false, message: `Cannot enter. Booking status is ${booking.status}` });
        }

        booking.entryTime = new Date();
        booking.status = 'ACTIVE';
        await booking.save();

        const slot = await ParkingSlot.findById(booking.slotId);
        if (slot) {
            slot.status = 'OCCUPIED';
            await slot.save();
            const io = req.app.get('io');
            if(io) io.emit('parkingSlotUpdated', { slotId: slot._id, status: 'OCCUPIED', parkingId: slot.parkingId });
        }

        res.json({ success: true, message: 'Vehicle entered successfully', data: booking });
    } catch (error) {
        next(error);
    }
};

const exitVehicle = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('vehicleId');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: `Cannot exit. Booking status is ${booking.status}` });
        }

        const exitTime = new Date();
        const durationMinutes = Math.ceil((exitTime.getTime() - new Date(booking.entryTime).getTime()) / (1000 * 60));
        
        const vehicleType = booking.vehicleId.vehicleType;
        const amount = priceCalculator(vehicleType, durationMinutes);

        booking.exitTime = exitTime;
        booking.duration = durationMinutes;
        booking.amount = amount;
        booking.status = 'COMPLETED';
        
        await booking.save();

        const slot = await ParkingSlot.findById(booking.slotId);
        if (slot) {
            slot.status = 'AVAILABLE';
            await slot.save();
            const io = req.app.get('io');
            if(io) io.emit('parkingSlotUpdated', { slotId: slot._id, status: 'AVAILABLE', parkingId: slot.parkingId });
        }

        res.json({ success: true, message: 'Vehicle exited successfully', data: booking });
    } catch (error) {
        next(error);
    }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, entryVehicle, exitVehicle };
