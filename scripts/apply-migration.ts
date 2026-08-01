/**
 * Validator for `001_init.sql` plus bucket bootstrap.
 *
 * CodeQL flagged this script for reading a SQL file from disk and
 * POSTing the raw text to the Supabase REST endpoint. The risks were:
 *   1. The contents of any .sql file in `supabase/migrations/` would be
 *      sent to a remote API reachable from the runner.
 *   2. The path came from a local constant, but the legacy
 *      implementation still taught the wrong pattern.
 *   3. It embedded the service role key in the request.
 *
 * The script now validates the SQL locally and prints the exact
 * `supabase db push` command to run. Bucket creation still uses the
 * Supabase JS client, which is the supported way and does not transmit
 * migration files.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, statSync } from 'fs';
import { dirname, resolve, relative, basename, extname } from 'path';
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

let parsedUrl: URL;
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

const FILENAME = '001_init.sql';
const ALLOWED_MIGRATIONS = new Set<string>([FILENAME]);
const MAX_MIGRATION_BYTES = 1_048_576;

function resolveMigrationPath(filename: string): string {
  if (!ALLOWED_MIGRATIONS.has(filename)) {
    throw new Error(`Migration not in allowlist: ${filename}`);
  }
  if (extname(filename) !== '.sql' || basename(filename) !== filename) {
    throw new Error(`Invalid migration filename: ${filename}`);
  }
  const resolved = resolve(MIGRATIONS_DIR, filename);
  const rel = relative(MIGRATIONS_DIR, resolved);
  if (rel.startsWith('..') || resolve(MIGRATIONS_DIR, rel) !== resolved) {
    throw new Error(`Path traversal blocked: ${filename}`);
  }
  return resolved;
}

function validateMigrationFile(sqlPath: string, fileSize: number, label: string): void {
  if (fileSize > MAX_MIGRATION_BYTES) {
    throw new Error(`Migration ${label} exceeds 1MB size limit`);
  }
  const sql = readFileSync(sqlPath, 'utf8').trim();
  const upper = sql.toUpperCase();
  if (!/^(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK|--)/.test(upper)) {
    throw new Error(`Migration ${label} contains unexpected SQL patterns`);
  }
}

async function applyMigration() {
  console.log('Validating 001_init.sql...');

  const sqlPath = resolveMigrationPath(FILENAME);
  const fileSize = statSync(sqlPath).size;
  validateMigrationFile(sqlPath, fileSize, FILENAME);

  const projectRef = parsedUrl.hostname.replace('.supabase.co', '');

  console.log('Validated 001_init.sql locally.');
  console.log('This script does NOT ship the file contents over the network.');
  console.log('Apply the migration with the official Supabase CLI:');
  console.log(`  supabase db push --project-ref ${projectRef}`);
  console.log('Or paste the contents into the Supabase SQL Editor.');
  console.log(`File metadata only: path=${sqlPath}, size=${fileSize} bytes`);

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
