// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
// };

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optional test query on startup
pool.query('SELECT NOW()')
  .then(res => console.log('✅ Connected to DB:', res.rows[0]))
  .catch(err => console.error('❌ DB connection error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
};

module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
