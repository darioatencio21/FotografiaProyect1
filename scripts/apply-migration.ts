import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const MIGRATIONS_DIR = resolve(PROJECT_ROOT, 'supabase', 'migrations');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(supabaseUrl);
  if (!parsedUrl.hostname.endsWith('.supabase.co')) {
    throw new Error('not a Supabase URL');
  }
} catch (err) {
  console.error('Invalid VITE_SUPABASE_URL:', err.message);
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

async function applyMigration() {
  console.log('Applying SQL migration...');

  const sqlPath = resolveMigrationPath('001_init.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('exec_sql RPC not available, trying direct SQL via REST...');
    const response = await fetch(`${parsedUrl.origin}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('Migration failed:', text);
      console.log('\nPlease run the SQL from supabase/migrations/001_init.sql manually in the Supabase SQL Editor.');
    } else {
      console.log('✓ Migration applied successfully!');
    }
  } else {
    console.log('✓ Migration applied successfully!');
  }

  const buckets = ['photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'];
  for (const bucket of buckets) {
    const { error: bucketError } = await supabase.storage.createBucket(bucket, {
      public: true,
    });
    if (bucketError && !bucketError.message?.includes('already exists')) {
      console.warn(`  Bucket "${bucket}": ${bucketError.message}`);
    } else {
      console.log(`  ✓ Bucket "${bucket}" ready`);
    }
  }

  console.log('\nSetup complete!');
}

applyMigration().catch(console.error);
