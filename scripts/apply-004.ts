/**
 * Validator for `004_fix_rls_policies.sql`.
 *
 * CodeQL flagged this script because it read a SQL migration from disk
 * and POSTed its full contents to the Supabase REST endpoint. That
 * pattern is dangerous in CI/CD because:
 *   1. The contents of arbitrary .sql files would be exfiltrated to a
 *      remote host reachable from the runner.
 *   2. The endpoint was not the official migration path, so the script
 *      could re-run any file the runner happened to have access to.
 *   3. It embedded a long-lived service role key in the request.
 *
 * The safe approach is to use the official Supabase CLI (which runs
 * locally and authenticates with the same service role key, but never
 * ships the file contents to a third party). This script now validates
 * the migration locally and prints the exact `supabase db push`
 * command the operator should run, without sending the file over the
 * network.
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

const FILENAME = '004_fix_rls_policies.sql';
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

function apply() {
  const sqlPath = resolveMigrationPath(FILENAME);
  const fileSize = statSync(sqlPath).size;
  validateMigrationFile(sqlPath, fileSize, FILENAME);

  const projectRef = parsedUrl.hostname.replace('.supabase.co', '');

  console.log(`Validated ${FILENAME} (${fileSize} bytes).`);
  console.log('This script does NOT transmit the file contents over the network.');
  console.log('Apply it with the official Supabase CLI:');
  console.log(`  supabase db push --project-ref ${projectRef}`);
  console.log('Or paste the contents manually into the Supabase SQL Editor.');
  console.log(`File metadata only: path=${sqlPath}, size=${fileSize} bytes`);
}

apply();
