import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function seedAdmin() {
  const id = `user-${nanoid(16)}`;
  const email = 'admin@signbank.com';
  const password = await bcrypt.hash('admin123', 10);
  const fullname = 'Administrator SignBank';

  const query = {
    text: 'INSERT INTO users(id, email, password, fullname) VALUES($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
    values: [id, email, password, fullname],
  };

  try {
    await pool.query(query);
    console.log('Admin user seeded successfully!');
    console.log('Email: admin@signbank.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
