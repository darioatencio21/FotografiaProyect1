import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

async function main() {
  // Test sign-in with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('1. Testing sign-in with anon key...');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log('   FAILED:', error.message);
    console.log('   Code:', error.code);
    console.log('   Status:', error.status);
  } else {
    console.log('   SUCCESS! Logged in as:', data.user?.email);
    console.log('   Session:', !!data.session);
    return;
  }

  // Check users with service role key
  if (serviceRoleKey) {
    const admin = createClient(supabaseUrl, serviceRoleKey);
    console.log('\n2. Checking users in Supabase Auth...');
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      console.log('   Cannot list users:', listError.message);
    } else {
      console.log(`   Total users: ${users.length}`);
      const found = users.find(u => u.email === email);
      if (found) {
        console.log(`   User ${email}:`);
        console.log(`     - ID: ${found.id}`);
        console.log(`     - Email confirmed: ${found.email_confirmed_at ? 'YES' : 'NO'}`);
        console.log(`     - Created: ${found.created_at}`);
        console.log(`     - Last sign in: ${found.last_sign_in_at || 'never'}`);

        if (!found.email_confirmed_at) {
          console.log('\n3. Confirming email...');
          const { error: confirmErr } = await admin.auth.admin.updateUserById(found.id, {
            email_confirm: true,
          });
          if (confirmErr) {
            console.log('   FAILED:', confirmErr.message);
          } else {
            console.log('   Email confirmed!');
          }
        }

        console.log('\n4. Resetting password...');
        const { error: pwdErr } = await admin.auth.admin.updateUserById(found.id, { password });
        if (pwdErr) {
          console.log('   FAILED:', pwdErr.message);
        } else {
          console.log('   Password reset!');
        }
      } else {
        console.log(`\n   User ${email} NOT FOUND in Auth.`);
        console.log('   Creating user...');
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createErr) {
          console.log('   FAILED:', createErr.message);
        } else {
          console.log(`   User created: ${newUser.user.email}`);
        }
      }
    }
  }
}

main().catch(console.error);
