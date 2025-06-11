const db = require('./db');

(async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Database connected successfully:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API is working');
});

app.listen(8000, () => console.log('Server started on http://localhost:8000'));
