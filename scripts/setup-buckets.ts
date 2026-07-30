import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupBuckets() {
  console.log('Creating storage buckets...\n');

  const buckets = ['photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'];

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
    });
    if (error) {
      if (error.message?.includes('already exists')) {
        console.log(`  ✓ Bucket "${bucket}" already exists`);
      } else {
        console.warn(`  ⚠ Bucket "${bucket}": ${error.message}`);
      }
    } else {
      console.log(`  ✓ Bucket "${bucket}" created`);
    }
  }

  console.log('\nBuckets setup complete!');
}

setupBuckets().catch(console.error);
