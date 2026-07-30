import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const MIGRATIONS_DIR = resolve(PROJECT_ROOT, 'supabase', 'migrations');

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let parsedUrl;
try {
  parsedUrl = new URL(supabaseUrl);
  if (!parsedUrl.hostname.endsWith('.supabase.co')) {
    throw new Error('not a Supabase URL');
  }
} catch (err) {
  console.error('Invalid VITE_SUPABASE_URL:', (err as Error).message);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function resolveMigrationPath(filename: string): string {
  const resolved = resolve(MIGRATIONS_DIR, filename);
  if (relative(MIGRATIONS_DIR, resolved).startsWith('..')) {
    throw new Error(`Path traversal blocked: ${filename}`);
  }
  return resolved;
}

function validateSqlContent(sql: string, label: string): void {
  if (sql.length > 1_048_576) {
    throw new Error(`Migration ${label} exceeds 1MB size limit`);
  }
  const upper = sql.trim().toUpperCase();
  if (!/^(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK|--)/.test(upper)) {
    throw new Error(`Migration ${label} contains unexpected SQL patterns`);
  }
}

async function apply() {
  const sqlPath = resolveMigrationPath('004_fix_rls_policies.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  validateSqlContent(sql, '004_fix_rls_policies.sql');
  console.log('Applying 004_fix_rls_policies.sql...');

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.warn('exec_sql RPC failed:', error.message);
    console.log('Trying direct REST API...');
    const resp = await fetch(`${parsedUrl.origin}/rest/v1/rpc/exec_sql`, {
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
