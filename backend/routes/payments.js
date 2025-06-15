const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentsController');

// 📌 Create Razorpay Order
router.post('/create-order', createRazorpayOrder);

// 📌 Verify Razorpay Payment
router.post('/verify', verifyPayment);

module.exports = router;
