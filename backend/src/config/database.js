import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Connection pool settings
  max: 20,                           // Maximum number of clients in the pool
  idleTimeoutMillis: 60000,         // 60 seconds idle timeout
  connectionTimeoutMillis: 10000,   // 10 seconds connection timeout
  statement_timeout: 30000,         // 30 seconds statement timeout
  query_timeout: 30000,             // 30 seconds query timeout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✓ New client connected to database');
});

export default pool;
