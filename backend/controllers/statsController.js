const db = require('../db');

exports.getEventStats = async (req, res) => {
  const organizerId = req.user.id;

  try {
    const result = await db.query(`
      SELECT 
        e.id,
        e.name,
        e.seats_total,
        COALESCE(SUM(b.seats), 0) AS tickets_booked,
        COALESCE(SUM(CASE WHEN b.attended = true THEN b.seats ELSE 0 END), 0) AS attendance,
        COALESCE(SUM(b.seats * e.price), 0) AS revenue
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.organizer_id = $1
      GROUP BY e.id
      ORDER BY e.name
    `, [organizerId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ message: 'Server error fetching event stats' });
  }
};
