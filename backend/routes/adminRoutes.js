const express = require('express');
const { 
    getDashboardStats, getAllUsers, getAllVehicles, getAllBookings, getAnalytics,
    createParking, createFloor, createSlot, setSlotStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/vehicles', getAllVehicles);
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);

router.post('/parking', createParking);
router.post('/floors', createFloor);
router.post('/slots', createSlot);
router.patch('/slots/:id/status', setSlotStatus);

module.exports = router;
