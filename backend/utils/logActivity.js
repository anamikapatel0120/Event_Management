// utils/logActivity.js
const pool = require('../db');

const logActivity = async (email, activity) => {
  try {
    await pool.query(
      'INSERT INTO logs (email, activity) VALUES ($1, $2)',
      [email, activity]
    );
  } catch (err) {
    console.error('Error logging activity:', err.message);
  }
};

module.exports = logActivity;
