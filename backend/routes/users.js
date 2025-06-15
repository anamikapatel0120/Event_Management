const express = require('express');
const router = express.Router();
const {
  getUser,
  updateUser,
  getUserLogs,
  getProfile,
  updateProfile,
  loginUser,
} = require('../controllers/usersController');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const { protect } = require('../middleware/authMiddleware');
const verifyToken = require('../middlewares/auth');
const db = require('../db');
// Routes that do NOT require authentication
// router.get('/:email', getUser);
// router.put('/:email', updateUser);
router.get('/logs/:email', getUserLogs);
router.post('/login', loginUser);

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });
// ✅ Secure profile routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('image'), updateProfile);



// POST /api/users/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }
    // if (result.rowCount === 0) {
    //   // Still return success to avoid leaking info
    //   return res.json({ message: 'Password reset link sent to email' });
    // }

    const userId = result.rows[0].id;

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;



    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error sending reset link' });
  }
});

// POST /api/users/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      decoded.id
    ]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});


module.exports = router;
