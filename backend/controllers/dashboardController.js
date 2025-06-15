const jwt = require('jsonwebtoken');
const db = require('../db'); // adjust path as needed

exports.getOrganizerDashboard = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'organizer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const organizer_id = decoded.id;

        // ✅ Use subqueries to relate bookings/tickets to organizer via events
        const [eventsResult, bookingsResult, revenueResult, ticketsResult] = await Promise.all([
            db.query(
                'SELECT * FROM events WHERE organizer_id = $1 ORDER BY start_time DESC',
                [organizer_id]
            ),
            db.query(
                `SELECT COUNT(*) FROM bookings 
                WHERE event_id IN (SELECT id FROM events WHERE organizer_id = $1)`,
                [organizer_id]
            ),
            db.query(
                // `SELECT SUM(e.price) AS total_revenue
                // FROM bookings b
                // JOIN events e ON b.event_id = e.id
                // WHERE e.organizer_id = $1`,
                // `SELECT SUM(e.seats_booked * e.price) AS total_revenue
                // FROM bookings b
                // JOIN events e ON b.event_id = e.id
                // WHERE e.organizer_id = $1`,
                `SELECT SUM(b.seats * e.price) AS total_revenue
                FROM bookings b
                JOIN events e ON b.event_id = e.id
                WHERE e.organizer_id = $1`,

                [organizer_id]

            ),
            db.query(
                // `SELECT COUNT(*) FROM tickets 
                // WHERE event_id IN (SELECT id FROM events WHERE organizer_id = $1)`,
                // [organizer_id]
                `SELECT COUNT(*) FROM bookings 
                WHERE event_id IN (SELECT id FROM events WHERE organizer_id = $1)`,
                [organizer_id]
            ),
        ]);

        res.json({
            totalEvents: eventsResult.rows.length,
            events: eventsResult.rows,
            totalBookings: parseInt(bookingsResult.rows[0].count) || 0,
            // totalRevenue: parseFloat(revenueResult.rows[0].sum) || 0,
            totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
            totalTickets: parseInt(ticketsResult.rows[0].count) || 0,
        });
    } catch (err) {
        console.error('Dashboard error:', err.message);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
};
