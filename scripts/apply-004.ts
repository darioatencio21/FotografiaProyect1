import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function apply() {
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '004_fix_rls_policies.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  console.log('Applying 004_fix_rls_policies.sql...');

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.warn('exec_sql RPC failed:', error.message);
    console.log('Trying direct REST API...');
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
      console.error('Migration failed:', text);
      console.log('\nRun the SQL manually from supabase/migrations/004_fix_rls_policies.sql in the Supabase SQL Editor.');
      process.exit(1);
    }
  }
  console.log('✓ Migration 004 applied successfully!');
}

apply().catch(console.error);
