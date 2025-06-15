const db = require('../db');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT id, name, email, profile_picture FROM users WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
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
      await db.query(query, values);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT e.name AS event_name, e.date, e.time, e.active 
       FROM events e 
       WHERE e.organizer_id = $1 
       ORDER BY e.date DESC`, 
       [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Logs error:', err);
    res.status(500).json({ error: 'Failed to load activity logs' });
  }
};
