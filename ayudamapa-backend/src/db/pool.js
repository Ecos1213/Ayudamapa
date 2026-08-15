import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

// Load environment variables before creating pool
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('error', (err) => {
  console.error('[DB_ERROR] Unexpected error on idle client:', err);
  process.exit(-1);
});

/**
 * Execute a query with the connection pool
 * @param {string} query - SQL query string
 * @param {array} values - Query parameters
 * @returns {Promise} Query result
 */
export const query = (queryString, values) => {
  return pool.query(queryString, values);
};

/**
 * Get a single row from query result
 * @param {string} query - SQL query string
 * @param {array} values - Query parameters
 * @returns {Promise<Object>} First row of results or null
 */
export const queryOne = async (queryString, values) => {
  const result = await pool.query(queryString, values);
  return result.rows[0] || null;
};

/**
 * Get all rows from query result
 * @param {string} query - SQL query string
 * @param {array} values - Query parameters
 * @returns {Promise<array>} Array of rows
 */
export const queryAll = async (queryString, values) => {
  const result = await pool.query(queryString, values);
  return result.rows;
};

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Async function that receives a client
 * @returns {Promise} Result of callback
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
