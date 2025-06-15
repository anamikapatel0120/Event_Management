const db = require('../db');
const jwt = require('jsonwebtoken');

exports.getEvents = async (req, res) => {
  const organizerId = req.user.id; // `verifyToken` should set this

  try {
    const result = await db.query(
      'SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC',
      [organizerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};


// Get a single event by ID (for booking page)
exports.getEventById = async (req, res) => {
  const eventId = parseInt(req.query.id, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const result = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows); // returns an array with one object
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};


// Get events with filters (public browse)
exports.getFilteredEvents = async (req, res) => {
  try {
    const { category, location, type } = req.query;

    let query = 'SELECT * FROM events WHERE active = true';
    const values = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      values.push(category);
    }
    if (location) {
      query += ` AND location = $${paramIndex++}`;
      values.push(location);
    }
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      values.push(type);
    }

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getFilteredEvents:', err.message);
    res.status(500).send('Server error');
  }
};


exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      time,
      location,
      type,
      category,
      seats_total,
      seats_booked,
      start_time,
      event_date,
      mode,
      venue,
      banner_url,
      total_seats,
      price,
      performer,
      link // ✅ Extract 'link' from request body
    } = req.body;

    // ✅ Validate Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'organizer') {
      return res.status(403).json({ error: 'Only organizers can create events' });
    }

    const organizer_id = decoded.id;

    // ✅ Validation: Require link if event is online
    if (mode === 'online' && (!link || link.trim() === '')) {
      return res.status(400).json({ error: 'Link is required for online events' });
    }

    const result = await db.query(
      `INSERT INTO events (
        name, description, date, time, location, type, category,
        organizer_id, seats_total, seats_booked, start_time,event_date, mode, venue,
        banner_url, total_seats, price, performer, link
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19
      ) RETURNING *`,
      [
        name, description, date, time, location, type, category,
        organizer_id, seats_total || 0, seats_booked || 0, start_time,event_date, mode, venue,
        banner_url, total_seats || 0, price || 0.00, performer, link || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};


// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      date,
      time,
      location,
      type,
      category,
      seats_total,
      seats_booked,
      start_time,
      mode,
      venue,
      banner_url,
      total_seats,
      price,
      performer
    } = req.body;

    // ✅ Extract organizer_id from JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'organizer') {
      return res.status(403).json({ error: 'Only organizers can update events' });
    }

    const organizer_id = decoded.id;

    // ✅ Ensure event belongs to this organizer before updating
    const checkEvent = await db.query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, organizer_id]
    );

    if (checkEvent.rows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to update this event' });
    }

    const result = await db.query(
      `UPDATE events SET
        name = $1,
        description = $2,
        date = $3,
        time = $4,
        location = $5,
        type = $6,
        category = $7,
        seats_total = $8,
        seats_booked = $9,
        start_time = $10,
        mode = $11,
        venue = $12,
        banner_url = $13,
        total_seats = $14,
        price = $15,
        performer = $16
      WHERE id = $17 RETURNING *`,
      [
        name,
        description,
        date,
        time,
        location,
        type,
        category,
        seats_total,
        seats_booked,
        start_time,
        mode,
        venue,
        banner_url,
        total_seats,
        price,
        performer,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};
// Update event
// exports.updateEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       description,
//       date,
//       time,
//       location,
//       type,
//       category,
//       organizer,
//       seats_total,
//       seats_booked,
//       start_time,
//       mode,
//       venue,
//       banner_url,
//       total_seats,
//       price,
//       performer
//     } = req.body;

//     const result = await db.query(
//       `UPDATE events SET
//         name = $1,
//         description = $2,
//         date = $3,
//         time = $4,
//         location = $5,
//         type = $6,
//         category = $7,
//         organizer = $8,
//         seats_total = $9,
//         seats_booked = $10,
//         start_time = $11,
//         mode = $12,
//         venue = $13,
//         banner_url = $14,
//         total_seats = $15,
//         price = $16,
//         performer = $17
//       WHERE id = $18 RETURNING *`,
//       [
//         name,
//         description,
//         date,
//         time,
//         location,
//         type,
//         category,
//         organizer,
//         seats_total,
//         seats_booked,
//         start_time,
//         mode,
//         venue,
//         banner_url,
//         total_seats,
//         price,
//         performer,
//         id
//       ]
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update event' });
//   }
// };


// Delete event
// exports.deleteEvent = async (req, res) => {
//   try {
//     const result = await db.query('DELETE FROM events WHERE id=$1 RETURNING *', [req.params.id]);
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to delete event' });
//   }
// };

exports.deleteEvent = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'organizer') {
      return res.status(403).json({ error: 'Only organizers can delete events' });
    }

    const organizer_id = decoded.id;

    // Ensure this organizer owns the event
    const check = await db.query('SELECT id FROM events WHERE id = $1 AND organizer_id = $2', [
      req.params.id,
      organizer_id,
    ]);

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to delete this event' });
    }

    const result = await db.query('DELETE FROM events WHERE id=$1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};


// Toggle active status
// exports.toggleActive = async (req, res) => {
//   try {
//     const result = await db.query(
//       'UPDATE events SET active = NOT active WHERE id = $1 RETURNING *',
//       [req.params.id]
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to toggle event status' });
//   }
// };

exports.toggleActive = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'organizer') {
      return res.status(403).json({ error: 'Only organizers can toggle event status' });
    }

    const organizer_id = decoded.id;

    // Check that the event belongs to the organizer
    const check = await db.query('SELECT id FROM events WHERE id = $1 AND organizer_id = $2', [
      req.params.id,
      organizer_id,
    ]);

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to toggle this event' });
    }

    const result = await db.query(
      'UPDATE events SET active = NOT active WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle event status' });
  }
};