const pool = require('../db');
const Razorpay = require('razorpay');
const { getIO } = require('../socket');
const jwt = require('jsonwebtoken');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Fetch attendees for an event (organizer access only)
exports.getAttendeesByEvent = async (req, res) => {
  const { eventId } = req.params;
  const authHeader = req.headers.authorization;

  try {
    // Check auth
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'organizer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const id = parseInt(eventId);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Verify this event belongs to this organizer
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND organizer_id = $2',
      [id, decoded.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not allowed to view this event' });
    }

    const result = await pool.query(
      `SELECT b.id, b.name, b.email, b.seats, b.booking_time, b.status, b.razorpay_payment_id
       FROM bookings b
       WHERE b.event_id = $1
       ORDER BY b.booking_time DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error in getAttendeesByEvent:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Cancel + refund booking (only if organizer owns the event)
exports.cancelBookingAdmin = async (req, res) => {
  const { bookingId } = req.params;
  const authHeader = req.headers.authorization;
  const client = await pool.connect();

  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'organizer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await client.query('BEGIN');

    // Find booking + verify organizer owns event
    const bRes = await client.query(
      `SELECT b.*, e.seats_booked, e.organizer_id
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.id = $1 AND b.status = 'active'`,
      [bookingId]
    );

    if (!bRes.rows.length) {
      throw new Error('Invalid booking or already canceled.');
    }

    const b = bRes.rows[0];

    if (b.organizer_id !== decoded.id) {
      throw new Error('You are not allowed to cancel this booking.');
    }

    await razorpay.payments.refund(b.razorpay_payment_id, { speed: 'optimum' });

    await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', bookingId]);
    await client.query('UPDATE events SET seats_booked = seats_booked - $1 WHERE id = $2',
      [b.seats, b.event_id]);

    await client.query('COMMIT');
    client.release();

    const io = getIO();
    io.emit(`seat-update-${b.event_id}`, { seats_booked: b.seats_booked - b.seats });

    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error(err);
    res.status(500).json({ message: err.message || 'Cancellation failed' });
  }
};