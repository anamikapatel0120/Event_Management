const express = require('express');
const { cancelBookingAdmin, getAttendeesByEvent } = require('../controllers/adminController');
const verifyToken = require('../middlewares/auth');
const db = require('../db');

// const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.get('/attendees/:eventId', verifyToken, getAttendeesByEvent);
router.post('/cancel-booking/:bookingId', verifyToken, cancelBookingAdmin);
// Route: GET /api/admin/attendees
// Route: GET /api/admin/attendees
router.get('/attendees', verifyToken, async (req, res) => {
  const organizerId = req.user.id; // assuming token contains id

  try {
    const result = await db.query(`
  SELECT 
    b.id,
    u.name,
    u.email,
    b.seats,
    b.status,
    b.booking_time,
    b.attended,
    e.name AS event_title
  FROM bookings b
  JOIN users u ON b.user_id = u.id
  JOIN events e ON b.event_id = e.id
  WHERE e.organizer_id = $1
  ORDER BY b.booking_time DESC
`, [organizerId]);


    res.json(result.rows); // Make sure to send `.rows` from PostgreSQL query result
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).json({ message: 'Server error fetching attendees' });
  }
});


module.exports = router;