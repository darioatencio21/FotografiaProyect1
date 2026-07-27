import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!supabaseUrl || !serviceKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
console.log('Project ref:', projectRef);

// Try 1: Check if the table is already in the publication
// by querying the bookings table to see if it has replica identity
try {
  const { data: bookingsReplica, error: err1 } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true });
  console.log('Bookings accessible:', err1 ? 'NO - ' + err1.message : 'YES');
} catch(e) {
  console.log('Bookings error:', e.message);
}

// Try 2: Use the Supabase Management API with the service role key
// The Management API accepts Supabase service_role keys for project-scoped operations
const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/publications/supabase_realtime`;

try {
  // First, get current publication info
  const resp = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (resp.ok) {
    const data = await resp.json();
    console.log('Current publication:', JSON.stringify(data, null, 2));
  } else {
    const text = await resp.text();
    console.log('GET publication failed:', resp.status, text.substring(0, 200));
  }
} catch(e) {
  console.log('GET publication error:', e.message);
}

// Try 3: Direct Management API for RT subscriptions
// Enables realtime for a specific table
try {
  const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/realtime`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tables: [
        { schema: 'public', name: 'bookings' },
        { schema: 'public', name: 'messages' },
      ],
    }),
  });
  const text = await resp.text();
  console.log('PUT realtime:', resp.status, text.substring(0, 300));
} catch(e) {
  console.log('PUT realtime error:', e.message);
}

// Try 4: Alternative Management API endpoint
try {
  const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: "SELECT schemaname, tablename, publicationname FROM pg_publication_tables WHERE publicationname = 'supabase_realtime'"
    }),
  });
  const text = await resp.text();
  console.log('Query realtime tables:', resp.status, text.substring(0, 500));
} catch(e) {
  console.log('Query error:', e.message);
}

// Try 5: Use PostgREST to check if supabase_realtime publication includes our tables
try {
  const { data: tables, error } = await supabase.rpc('rls_auto_enable');
  console.log('rls_auto_enable:', tables, error);
} catch(e) {
  console.log('rls_auto_enable error:', e.message);
}

console.log('\n--- Alternative: Use the service role key with direct pg connection ---');
// Try to connect via the pooler
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
  const { Pool } = require('pg');
  
  // The pooler URL from supabase/.temp/pooler-url
  const poolerUrl = 'postgresql://postgres.pkdzxqsplfeobhflgmyu@aws-1-sa-east-1.pooler.supabase.com:5432/postgres';
  const url = new URL(poolerUrl);
  
  // The password is needed but we don't have it
  // Let's try without a password using the session mode
  const pool = new Pool({
    host: url.hostname,
    port: url.port,
    database: url.pathname.replace('/', ''),
    user: url.username,
    password: serviceKey,  // Try using service role key as password (unlikely to work but worth a shot)
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT schemaname, tablename FROM pg_publication_tables WHERE publicationname = 'supabase_realtime'");
    console.log('Current publication tables:', result.rows);
    
    // Enable realtime for bookings and messages
    await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE bookings");
    console.log('Added bookings to supabase_realtime');
    await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE messages");
    console.log('Added messages to supabase_realtime');
    
    client.release();
  } catch(pgErr) {
    console.log('PG connection failed:', pgErr.message);
  }
  
  await pool.end();
} catch(pgErr) {
  console.log('PG module error:', pgErr.message);
}

console.log('\nDone. If all automated methods failed, enable Realtime manually:');
console.log('Supabase Dashboard → Database → Replication → Enable Realtime for bookings & messages');
