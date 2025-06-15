const db = require('../db');
const { getIO } = require('../socket');
const QRCode = require('qrcode');

// exports.getMyBookings = async (req, res) => {
//   const userEmail = req.user.email;

//   try {
//     const result = await db.query(`
//       SELECT b.*, e.name AS event_name, e.event_date, e.start_time, e.location, e.type, e.link
//       FROM bookings b
//       JOIN events e ON b.event_id = e.id
//       WHERE b.email = $1
//     `, [userEmail]);

//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error fetching user bookings:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.getMyBookings = async (req, res) => {
  const userEmail = req.user.email;

  try {
    const result = await db.query(`
      SELECT 
        b.*, 
        e.name AS event_name, 
        e.event_date, 
        e.start_time, 
        e.location, 
        e.type, 
        e.link, 
        e.performer,
        ou.name AS organizer_name,
        ou.email AS organizer_email,
        bu.name AS user_name,
        bu.email AS user_email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN users ou ON e.organizer_id = ou.id
      LEFT JOIN users bu ON b.email = bu.email
      WHERE b.email = $1
    `, [userEmail]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// exports.deleteBooking = async (req, res) => {
//   const bookingId = req.params.id;

//   try {
//     // Delete booking
//     await db.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
//     res.json({ success: true, message: 'Booking deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting booking:', err);
//     res.status(500).json({ success: false, message: 'Failed to delete booking' });
//   }
// };


exports.cancelBooking = async (req, res) => {
  const bookingId = req.params.bookingId;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const bookingRes = await client.query(
      `SELECT b.*, e.date AS event_date,
       e.start_time
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingRes.rows[0];
    const eventDateTime = new Date(`${booking.event_date}T${booking.start_time}`);

    const now = new Date();

    // 2. If event has already passed, don't cancel
    if (eventDateTime < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot cancel a past event booking.' });
    }


    // 3. Soft delete (mark as cancelled)
    await client.query(
      `UPDATE bookings SET status = 'cancelled', seats = 0 WHERE id = $1`,
      [bookingId]
    );

    // 4. Update event seat count
    await client.query(
      `UPDATE events SET seats_booked = seats_booked - $1 WHERE id = $2`,
      [booking.seats, booking.event_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Booking cancelled successfully.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: 'Error cancelling booking.' });
  } finally {
    client.release();
  }
};