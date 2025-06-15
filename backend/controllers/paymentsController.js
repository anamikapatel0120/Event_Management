const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();
const pool = require('../db');
const QRCode = require('qrcode');
const { getIO } = require('../socket');

// 🔐 Initialize Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🟢 Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err);
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
};

// ✅ Verify Payment & Save Booking
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    eventId,
    name,
    age,
    email,
    seats,
  } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 🔎 Check seat availability with row lock (FOR UPDATE)
    const eventRes = await client.query(
      'SELECT seats_total, seats_booked FROM events WHERE id = $1 FOR UPDATE',
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      throw new Error('Event not found');
    }

    const { seats_total, seats_booked } = eventRes.rows[0];
    const totalRequestedSeats = parseInt(seats);
    const newSeatCount = seats_booked + totalRequestedSeats;

    if (newSeatCount > seats_total) {
      throw new Error('Not enough seats available');
    }

    // 🎟 Generate QR Code
    const qrData = `EventID:${eventId}|Name:${name}|Email:${email}|Seats:${seats}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // 📝 Insert into bookings
    await client.query(
      `INSERT INTO bookings 
        (event_id, name, age, email, seats, booking_time, qr_code, status)
       VALUES 
        ($1, $2, $3, $4, $5, NOW(), $6, 'active')`,
      [eventId, name, age, email, totalRequestedSeats, qrCode]
    );

    // 🔄 Update event seat count
    await client.query(
      'UPDATE events SET seats_booked = $1 WHERE id = $2',
      [newSeatCount, eventId]
    );

    await client.query('COMMIT');
    client.release();

    // 🔊 Emit real-time update
    const io = getIO();
    io.emit(`seat-update-${eventId}`, { seats_booked: newSeatCount });

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('❌ Booking failed after payment verification:', error.message || error);
    res.status(500).json({ success: false, message: 'Booking failed' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
