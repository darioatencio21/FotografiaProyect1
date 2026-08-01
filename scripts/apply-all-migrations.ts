/**
 * Local validator for the canonical pending migrations.
 *
 * CodeQL flagged this script because it read each .sql file and POSTed
 * its full contents to the Supabase REST endpoint. The risks were:
 *   1. The contents of every file in `supabase/migrations/` would be
 *      sent to a remote API reachable from the runner.
 *   2. The path was controlled by an internal array, but the pattern
 *      still taught that running arbitrary .sql content over HTTP is
 *      acceptable.
 *   3. It embedded the service role key in every request.
 *
 * The script now validates the migration set locally and prints the
 * exact `supabase db push` command the operator should run. No file
 * contents leave the runner.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { readFileSync, statSync } from 'fs';
import { dirname, resolve, relative, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const MIGRATIONS_DIR = resolve(PROJECT_ROOT, 'supabase', 'migrations');

const supabaseUrl = process.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL in .env.local');
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

const migrations = [
  '005_invoices.sql',
  '006_testimonial_moderation.sql',
  '007_add_reminder.sql',
  '008_bookings_schema.sql',
  '009_approval_flow.sql',
];

const ALLOWED_MIGRATIONS = new Set<string>(migrations);
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

function applyAll() {
  console.log('Validating pending migrations locally...\n');
  console.log('This script does NOT transmit file contents over the network.');
  console.log('Apply them with the official Supabase CLI:');
  const projectRef = parsedUrl.hostname.replace('.supabase.co', '');
  console.log(`  supabase db push --project-ref ${projectRef}\n`);

  let allValid = true;
  for (const file of migrations) {
    const sqlPath = resolveMigrationPath(file);
    const fileSize = statSync(sqlPath).size;
    try {
      validateMigrationFile(sqlPath, fileSize, file);
      console.log(`  ${file}... ok (${fileSize} bytes)`);
    } catch (err) {
      allValid = false;
      console.log(`  ${file}... FAIL (${(err as Error).message})`);
    }
  }

  if (!allValid) {
    process.exit(1);
  }

  console.log('\nAll migrations validated. Run `supabase db push` to apply.');
}

applyAll();
