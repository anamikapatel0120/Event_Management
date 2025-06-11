// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();
// const db = require('./db');
// const http = require('http');
// const socketSetup = require('./socket');

// const app = express();
// const server = http.createServer(app);
// const socketIo = require('socket.io');
// const io = socketIo(server, { cors: { origin: "*" } });

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// });
// const upload = multer({ storage });

// // ====== Auth Routes ======

// // Register
// app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
//   const { name, email, role, password, useDefault } = req.body;
//   const imagePath = useDefault === 'true' || !req.file
//     ? 'uploads/default-profile.png'
//     : req.file.path;

//   try {
//     const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (existing.rows.length > 0) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }

//     await db.query(
//       'INSERT INTO users(name, email, role, password, profile_picture) VALUES($1, $2, $3, $4, $5)',
//       [name, email, role, password, imagePath]
//     );

//     res.status(201).json({ success: true, message: 'User registered successfully' });
//   } catch (err) {
//     console.error('Registration Error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Login
// app.post('/api/login', async (req, res) => {
//   const { emailOrName, role, password } = req.body;

//   try {
//     const result = await db.query(
//       'SELECT * FROM users WHERE (email = $1 OR name = $1) AND role = $2',
//       [emailOrName, role]
//     );

//     const user = result.rows[0];
//     if (!user || user.password !== password) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     res.json({ success: true, user });
//   } catch (err) {
//     console.error('Login Error:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // ====== Organizer Endpoints ======

// // Create Event
// app.post('/api/organizer/events', async (req, res) => {
//   const { title, type, date, time, venue, platform, speakers, isLive } = req.body;
//   try {
//     const result = await db.query(
//       `INSERT INTO events (title, type, date, time, venue, platform, speakers, is_live, organizer_id)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
//       [title, type, date, time, venue, platform, speakers, isLive, req.user.id]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Event create error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // Update Event
// app.put('/api/organizer/events/:id', async (req, res) => {
//   const { id } = req.params;
//   const { title, type, date, time, venue, platform, speakers, isLive } = req.body;
//   try {
//     const result = await db.query(
//       `UPDATE events SET title=$1,type=$2,date=$3,time=$4,venue=$5,platform=$6,
//        speakers=$7,is_live=$8 WHERE id=$9 AND organizer_id=$10 RETURNING *`,
//       [title, type, date, time, venue, platform, speakers, isLive, id, req.user.id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Event update error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // Event Attendees
// app.get('/api/organizer/events/:id/attendees', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await db.query(`
//       SELECT users.name, users.email, attendees.seat_id, seats.label AS seat_label, attendees.booked_at
//       FROM attendees
//       JOIN users ON attendees.user_id = users.id
//       JOIN seats ON attendees.seat_id = seats.id
//       WHERE attendees.event_id = $1`, [id]);
//     res.json(result.rows.map(r => ({
//       ...r,
//       booked_at: r.booked_at.toISOString()
//     })));
//   } catch (err) {
//     console.error('Attendees fetch error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // Event Stats
// app.get('/api/organizer/events/:id/stats', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const revenueRes = await db.query(
//       `SELECT TO_CHAR(date,'Mon YYYY') AS month, SUM(price) AS total
//        FROM attendees JOIN events USING(event_id)
//        WHERE event_id = $1
//        GROUP BY 1 ORDER BY date`, [id]
//     );
//     const ratingCounts = await db.query(
//       `SELECT rating, COUNT(*) FROM feedback WHERE event_id = $1 GROUP BY rating`, [id]
//     );
//     const avgRatingRes = await db.query(
//       `SELECT AVG(rating)::numeric(3,2) AS avg_rating FROM feedback WHERE event_id = $1`, [id]
//     );
//     const totalRes = await db.query(
//       `SELECT COUNT(*) FROM attendees WHERE event_id = $1`, [id]
//     );

//     const revenue = revenueRes.rows.map(r => +r.total);
//     const months = revenueRes.rows.map(r => r.month);
//     const ratingsCount = [1, 2, 3, 4, 5].map(i => {
//       const row = ratingCounts.rows.find(r => +r.rating === i);
//       return row ? +row.count : 0;
//     });
//     const avgRating = avgRatingRes.rows[0].avg_rating || 0;
//     const totalAttendees = +totalRes.rows[0].count;

//     res.json({ revenue, months, ratingsCount, avgRating, totalAttendees });
//   } catch (err) {
//     console.error('Stats fetch error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // Organizer Profile
// app.get('/api/organizer/profile', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const prof = await db.query('SELECT name, email, profile_picture FROM users WHERE id = $1', [userId]);
//     const events = await db.query('SELECT id, title, date FROM events WHERE organizer_id = $1 ORDER BY date DESC LIMIT 5', [userId]);
//     res.json({ ...prof.rows[0], history: events.rows });
//   } catch (err) {
//     console.error('Profile fetch error:', err);
//     res.status(500).send('Server error');
//   }
// });

// app.put('/api/organizer/profile', upload.single('profilePicture'), async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, email } = req.body;
//     const imagePath = req.file ? req.file.filename : null;

//     const result = await db.query(
//       `UPDATE users SET name = $1, email = $2${imagePath ? `, profile_picture = $3` : ''} WHERE id = $4 RETURNING id, name, email, profile_picture`,
//       imagePath ? [name, email, imagePath, userId] : [name, email, userId]
//     );
//     return res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Profile update error:', err);
//     return res.status(500).send('Server error');
//   }
// });

// // Notifications
// app.get('/api/organizer/notifications', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const result = await db.query(
//       `SELECT id, message, read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
//       [userId]
//     );
//     return res.json(result.rows);
//   } catch (err) {
//     console.error('Notifications fetch error:', err);
//     return res.status(500).send('Server error');
//   }
// });

// app.post('/api/organizer/notifications/:id/read', async (req, res) => {
//   try {
//     const notifId = req.params.id;
//     await db.query(`UPDATE notifications SET read = TRUE WHERE id = $1`, [notifId]);
//     return res.json({ success: true });
//   } catch (err) {
//     console.error('Mark read error:', err);
//     return res.status(500).send('Server error');
//   }
// });

// // ====== Seats ======

// app.get('/api/events/:id/seats', async (req, res) => {
//   const { id } = req.params;
//   const result = await db.query('SELECT * FROM seats WHERE event_id = $1 ORDER BY label', [id]);
//   res.json(result.rows);
// });

// app.put('/api/events/:eid/seats/:sid', async (req, res) => {
//   const { eid, sid } = req.params;
//   const { status } = req.body;
//   const result = await db.query(
//     'UPDATE seats SET status = $1 WHERE id = $2 AND event_id = $3 RETURNING *',
//     [status, sid, eid]
//   );
//   const updated = result.rows[0];
//   io.to(`event_${eid}`).emit('seatUpdated', { eventId: eid, seatId: updated.id, status: updated.status });
//   res.json(updated);
// });

// // ====== Socket.IO Events ======
// io.on('connection', socket => {
//   console.log('Socket connected');

//   socket.on('joinEvent', ({ eventId }) => {
//     socket.join(`event_${eventId}`);
//   });

//   socket.on('leaveEvent', ({ eventId }) => {
//     socket.leave(`event_${eventId}`);
//   });

//   socket.on('seatChange', msg => {
//     io.to(`event_${msg.eventId}`).emit('seatUpdated', msg);
//   });
// });

// // ====== Root Route ======
// app.get('/', (req, res) => {
//   res.send('API is running');
// });

// // ====== Start Server ======
// server.listen(5000, () => console.log('Server started on http://localhost:5000'));







const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ====== Auth Routes ======

// Register
app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
  const { name, email, role, password, useDefault } = req.body;
  const imagePath = useDefault === 'true' || !req.file
    ? 'uploads/default-profile.png'
    : req.file.path;

  try {
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    await db.query(
      'INSERT INTO users(name, email, role, password, profile_picture) VALUES($1, $2, $3, $4, $5)',
      [name, email, role, password, imagePath]
    );

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { emailOrName, role, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE (email = $1 OR name = $1) AND role = $2',
      [emailOrName, role]
    );

    const user = result.rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('Auth API is running');
});

// Start server
app.listen(5000, () => console.log('Server running at http://localhost:5000'));
