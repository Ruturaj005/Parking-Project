const express = require('express');
const { getAllParking, getParkingById, getAvailableSlots } = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAllParking);
router.get('/:id', protect, getParkingById);
router.get('/:id/available-slots', protect, getAvailableSlots);

module.exports = router;
