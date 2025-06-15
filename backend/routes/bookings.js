const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const verifyToken = require('../middlewares/auth');
const db = require('../db');

const {
  createRazorpayOrder,
  verifyPayment
} = require('../controllers/paymentsController');

// 🧾 Create Razorpay order
router.post('/razorpay-order', createRazorpayOrder);

// ✅ Verify Razorpay payment
router.post('/verify', verifyPayment);

// 📌 Get bookings by user
router.get('/user', verifyToken, bookingsController.getMyBookings);


// 📌 Cancel booking
// router.post('/cancel/:bookingId', cancelBooking);
// router.delete('/:id', bookingsController.deleteBooking);
router.post('/cancel/:bookingId', verifyToken, bookingsController.cancelBooking);


module.exports = router;
