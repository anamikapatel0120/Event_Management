const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const http = require('http');
const bcrypt = require('bcrypt');
const SECRET = 'your_random_secret_key';
// const { io } = require('./socket'); 



const db = require('./db');
const eventsRoutes = require('./routes/events');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users'); // includes loginUser
// const { init } = require('./socket');
const statsRoutes = require('./routes/stats');
const exportRoutes = require('./routes/exportRoutes');
const organizerRoutes = require('./routes/organizer')


const app = express();
const server = http.createServer(app);
// init(server);
// socket.init(server);

// ✅ Initialize Socket.io
const socket = require('./socket');
socket.init(server);
const io = socket.getIO();

// Stripe Webhook (must be before express.json)
app.use('/api/bookings/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes); // includes login and register
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/organizer', organizerRoutes);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));





// Multer config for profile uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


app.post('/api/bookings/demo', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.user_id || decoded.id || decoded.sub;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Token does not contain user ID' });
    }
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }

  const { event_id, name, age, email, seats, booking_time, qr_code, status } = req.body;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Insert booking
    await client.query(`
      INSERT INTO bookings (event_id, name, age, email, seats, booking_time, qr_code, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [event_id, name, age, email, seats, booking_time, qr_code, status, userId]);

    // Update seats_booked and get new count
    const result = await client.query(`
      UPDATE events 
      SET seats_booked = seats_booked + $1 
      WHERE id = $2 
      RETURNING seats_booked
    `, [seats, event_id]);

    const updatedSeats = result.rows[0]?.seats_booked;

    await client.query('COMMIT');

    // Emit socket update
    if (updatedSeats !== undefined) {
      io.emit(`seat-update-${event_id}`, { seats_booked: updatedSeats });
    }

    res.json({ success: true });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Booking insert error:', err);
    res.status(500).json({ success: false, error: 'Insert or update failed' });
  } finally {
    client.release();
  }
});

app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
  const { name, email, role, password, useDefault } = req.body;
  const imagePath = useDefault === 'true' || !req.file
    ? 'default-profile.png'
    : req.file.filename;

  try {
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // ✅ hash the password

    await db.query(
      'INSERT INTO users(name, email, role, password, profile_picture) VALUES($1, $2, $3, $4, $5)',
      [name, email, role, hashedPassword, imagePath]
    );

    // Fetch the newly inserted user
    const result = await db.query('SELECT id, name, email, role FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      success: true, user,
      token, message: 'User registered successfully'
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard Overview Example
app.get('/api/dashboard-overview', async (req, res) => {
  try {
    const eventsRes = await db.query('SELECT id, name, date FROM events');
    const events = eventsRes.rows;

    const overview = await Promise.all(events.map(async event => {
      const q = 'SELECT SUM(quantity) AS tickets_sold, SUM(quantity * price) AS revenue FROM tickets WHERE event_id = $1';
      const { rows } = await db.query(q, [event.id]);
      return {
        id: event.id,
        name: event.name,
        date: event.date,
        ticketsSold: parseInt(rows[0].tickets_sold) || 0,
        revenue: parseFloat(rows[0].revenue) || 0
      };
    }));

    const upcoming = overview.filter(e => new Date(e.date) > new Date());

    res.json({
      totalEvents: events.length,
      overview,
      upcomingCount: upcoming.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Auth API is running');
});

// Start server
server.listen(5000, () => console.log('Server running at http://localhost:5000'));
