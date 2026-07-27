import { readFileSync } from 'fs';
import { Pool } from 'pg';

const envContent = readFileSync('.env.local', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const projectRef = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

console.log('Project ref:', projectRef);

const pool = new Pool({
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.' + projectRef,
  password: serviceKey,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
});

try {
  const client = await pool.connect();
  console.log('Connected to database!');

  const result = await client.query(
    "SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'"
  );
  console.log('Current supabase_realtime tables:', JSON.stringify(result.rows));

  await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE bookings');
  console.log('Added bookings to supabase_realtime');

  await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE messages');
  console.log('Added messages to supabase_realtime');

  const result2 = await client.query(
    "SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'"
  );
  console.log('Updated publication tables:', JSON.stringify(result2.rows));

  client.release();
  console.log('Done!');
} catch (e) {
  console.error('Error:', e.message);
}

await pool.end();
process.exit(0);
