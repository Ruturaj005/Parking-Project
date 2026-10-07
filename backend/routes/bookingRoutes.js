const express = require('express');
const { createBooking, getMyBookings, getBookingById, cancelBooking, entryVehicle, exitVehicle } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createBooking)
    .get(getMyBookings);

router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/entry', entryVehicle);
router.post('/:id/exit', exitVehicle);

module.exports = router;
