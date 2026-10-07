const express = require('express');
const { createPayment, paymentSuccess, paymentFail } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/create', createPayment);
router.post('/:id/success', paymentSuccess);
router.post('/:id/fail', paymentFail);

module.exports = router;
