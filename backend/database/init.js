import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config({ path: '.env' });

console.log('📌 Database URL detected:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('📌 Environment:', process.env.NODE_ENV || 'development');

// Parse the connection string to get the default database (postgres)
const connectionUrl = new URL(process.env.DATABASE_URL);
const defaultDbUrl = `postgresql://${connectionUrl.username}:${connectionUrl.password}@${connectionUrl.host}:${connectionUrl.port}/postgres`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const createDatabaseIfNotExists = async () => {
  const defaultPool = new Pool({
    connectionString: defaultDbUrl,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  const client = await defaultPool.connect();
  try {
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'bookmyshow_db'"
    );
    if (res.rows.length === 0) {
      console.log('🔧 Creating database "bookmyshow_db"...');
      await client.query('CREATE DATABASE bookmyshow_db');
      console.log('✅ Database created successfully');
    } else {
      console.log('✓ Database already exists');
    }
  } finally {
    client.release();
    await defaultPool.end();
  }
};

const initializeDatabase = async () => {
  await createDatabaseIfNotExists();
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database...');

    // Drop existing tables (for fresh setup)
    await client.query('DROP TABLE IF EXISTS bookings CASCADE');
    await client.query('DROP TABLE IF EXISTS seats CASCADE');
    await client.query('DROP TABLE IF EXISTS shows CASCADE');
    await client.query('DROP TABLE IF EXISTS movies CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    // Create Users table with role-based access
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role ON users(role);
    `);
    console.log('✅ Users table created');

    // Create Movies table
    await client.query(`
      CREATE TABLE movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        genre VARCHAR(100),
        rating DECIMAL(3,1),
        duration_minutes INT,
        poster_url VARCHAR(500),
        release_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_movies_title ON movies(title);
      CREATE INDEX idx_movies_release_date ON movies(release_date);
    `);
    console.log('✅ Movies table created');

    // Create Shows table
    await client.query(`
      CREATE TABLE shows (
        id SERIAL PRIMARY KEY,
        movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        show_date DATE NOT NULL,
        show_time TIME NOT NULL,
        screen_name VARCHAR(50),
        total_seats INT NOT NULL,
        available_seats INT NOT NULL,
        price_standard DECIMAL(10,2),
        price_premium DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_shows_movie_id ON shows(movie_id);
      CREATE INDEX idx_shows_show_date ON shows(show_date);
      CREATE INDEX idx_shows_movie_date ON shows(movie_id, show_date);
    `);
    console.log('✅ Shows table created');

    // Create Seats table
    await client.query(`
      CREATE TABLE seats (
        id SERIAL PRIMARY KEY,
        show_id INT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        seat_row CHAR(1) NOT NULL,
        seat_number INT NOT NULL,
        seat_type VARCHAR(50) DEFAULT 'standard',
        is_booked BOOLEAN DEFAULT FALSE,
        booking_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(show_id, seat_row, seat_number)
      );
      CREATE INDEX idx_seats_show_id ON seats(show_id);
      CREATE INDEX idx_seats_show_booked ON seats(show_id, is_booked);
    `);
    console.log('✅ Seats table created');

    // Create Bookings table
    await client.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        booking_reference VARCHAR(20) UNIQUE NOT NULL,
        show_id INT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        seat_ids INT[] NOT NULL,
        total_price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        confirmed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_bookings_show_id ON bookings(show_id);
      CREATE INDEX idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX idx_bookings_status ON bookings(status);
      CREATE INDEX idx_bookings_created_at ON bookings(created_at);
    `);
    console.log('✅ Bookings table created');

    console.log('✨ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

initializeDatabase();
