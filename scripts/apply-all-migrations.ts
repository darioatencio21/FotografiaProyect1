import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const migrations = [
  '005_invoices.sql',
  '006_testimonial_moderation.sql',
  '007_add_reminder.sql',
  '008_bookings_schema.sql',
  '009_approval_flow.sql',
];

async function execSql(sql: string, label: string): Promise<boolean> {
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.warn(`  exec_sql RPC failed for ${label}: ${error.message}`);
    console.log('  Trying direct REST API...');
    const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`  Migration ${label} failed:`, text);
      return false;
    }
  }
  return true;
}

async function applyAll() {
  console.log('Applying pending migrations...\n');

  for (const file of migrations) {
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', file);
    const sql = readFileSync(sqlPath, 'utf8').trim();
    if (!sql) {
      console.log(`  ${file}: empty, skipping`);
      continue;
    }
    process.stdout.write(`  ${file}... `);
    const ok = await execSql(sql, file);
    console.log(ok ? '✓' : '✗');
  }

  console.log('\nDone. Refresh the app to verify the console errors are gone.');
}

applyAll().catch(console.error);
