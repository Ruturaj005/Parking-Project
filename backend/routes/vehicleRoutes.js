const express = require('express');
const { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All vehicle routes are protected

router.route('/')
    .post(addVehicle)
    .get(getVehicles);

router.route('/:id')
    .get(getVehicleById)
    .put(updateVehicle)
    .delete(deleteVehicle);

module.exports = router;
