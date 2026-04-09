const { Pool } = require('pg');

async function test(name) {
  console.log(`Testing ${name}...`);
  const p = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: name,
    password: '5926',
    port: 5432,
    connectionTimeoutMillis: 5000,
  });
  try {
    const c = await p.connect();
    console.log(`✅ SUCCESS: Connected to ${name}`);
    c.release();
    return true;
  } catch (e) {
    console.log(`❌ FAIL: ${name} - ${e.message}`);
    return false;
  } finally {
    await p.end();
  }
}

async function run() {
  await test('gradprojdb');
  await test('gradprojfb');
  await test('postgres');
}

run();
