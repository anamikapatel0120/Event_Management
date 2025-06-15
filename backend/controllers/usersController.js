const pool = require('../db');
const logActivity = require('../utils/logActivity');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ⛔ Don't expose password in responses
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};


// const getProfile = async (req, res) => {
//   const { id } = req.user.id; // injected by middleware

//   try {
//     // const userId = req.user.id;
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json(sanitizeUser(result.rows[0]));
//   } catch (err) {
//     console.error('Error fetching profile:', err);
//     res.status(500).json({ message: 'Server error while fetching profile' });
//   }
// };

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, name, email, role, profile_picture FROM users WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const updates = [];
    const values = [];
    let index = 1;

    if (name) {
      updates.push(`name = $${index++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${index++}`);
      values.push(email);
    }
    if (image) {
      updates.push(`profile_picture = $${index++}`);
      values.push(image);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${index++}`);
      values.push(hashedPassword);
    }

    values.push(userId);

    if (updates.length > 0) {
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${index}`;
      await pool.query(query, values);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getUser = async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(sanitizeUser(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔁 Update any user (admin use)
const updateUser = async (req, res) => {
  const { email } = req.params;
  const { name, email: newEmail, password } = req.body;

  try {
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2, password=COALESCE($3, password) WHERE email=$4 RETURNING *',
      [name, newEmail, hashedPassword || null, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(sanitizeUser(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Update failed');
  }
};

// 🧾 User logs
const getUserLogs = async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      'SELECT activity, timestamp FROM logs WHERE email = $1 ORDER BY timestamp DESC',
      [email]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Server error while fetching logs' });
  }
};

// 🔐 Login
const loginUser = async (req, res) => {
  const { emailOrName, role, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE (email = $1 OR name = $1) AND role = $2`,
      [emailOrName, role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    await logActivity(user.email, 'Logged in');

    res.json({
      success: true,
      message: 'Login successful',
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUser,
  updateUser,
  getUserLogs,
  getProfile,
  updateProfile,
  loginUser
};
