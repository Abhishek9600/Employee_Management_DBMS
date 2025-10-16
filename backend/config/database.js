const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL for production (Supabase), individual vars for development
const config = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
} : {
  // Development (local PostgreSQL)
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'employee_management',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

const pool = new Pool(config);

// Enhanced connection logging
pool.on('connect', () => {
  console.log('Database connected successfully');
  if (process.env.DATABASE_URL) {
    console.log('Connected to: Supabase PostgreSQL');
  } else {
    console.log('Connected to: Local PostgreSQL');
  }
});

pool.on('error', (err, client) => {
  console.error('Database connection error:', err);
});

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    client.release();
  } catch (error) {
    console.error('Database connection test failed:', error.message);
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};