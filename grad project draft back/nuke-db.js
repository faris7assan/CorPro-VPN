const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gradprojfb',
  password: '5926',
  port: 5432,
});

async function nukeAndRebuild() {
  try {
    const client = await pool.connect();
    console.log('--- Connected to DB for Nuking old tables ---');

    // List of tables seen in the screenshot
    const tables = [
      'audit_logs', 'compliance_checks', 'compliance_policies', 
      'compliance_reports', 'devices', 'organizations', 
      'otp_codes', 'server_config', 'users', 
      'vpn_sessions', 'website_rules'
    ];

    for (const table of tables) {
      console.log(`Dropping table ${table}...`);
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    console.log('✅ All old tables dropped.');

    // Create the new simplified tables
    console.log('Creating simplified users table...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        failed_attempts INT DEFAULT 0,
        lock_until TIMESTAMPTZ
      )
    `);

    console.log('Creating simplified otp_codes table...');
    await client.query(`
      CREATE TABLE otp_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        last_sent TIMESTAMPTZ NOT NULL
      )
    `);

    // Seed the user
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('Ys5926', 10);
    await client.query(
      'INSERT INTO users(email, password_hash) VALUES($1, $2)',
      ['ys5313944@gmail.com', hash]
    );

    console.log('✅ Fresh Database Ready with seeded user: ys5313944@gmail.com');
    client.release();
  } catch (err) {
    console.error('❌ Nuke Error:', err.message);
  } finally {
    await pool.end();
  }
}

nukeAndRebuild();
