import pool from '../src/config/database.js';
import { hashPassword } from '../src/utils/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdminUser = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding admin user...');
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'adminBMS';
    
    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }
    
    // Hash password
    const passwordHash = await hashPassword(adminPassword);
    
    // Create admin user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role`,
      [adminEmail, passwordHash, 'Admin', 'User', 'admin']
    );
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔐 Password: adminBMS');
    console.log('👤 Role: admin');
    console.log('');
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Run seed
seedAdminUser()
  .then(() => {
    console.log('✓ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
