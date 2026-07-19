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

async function main() {
  const email = process.argv[2] || 'admin@miriamcampos.com';
  const password = process.argv[3] || 'Admin123!';

  console.log(`Creating admin user: ${email}`);

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (!listError) {
    const existing = existingUsers.users.find(u => u.email === email);
    if (existing) {
      console.log(`User ${email} already exists (confirmed: ${!!existing.email_confirmed_at})`);

      if (!existing.email_confirmed_at) {
        console.log('Email not confirmed. Confirming now...');
        const { error } = await supabase.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
        });
        if (error) {
          console.error('Error confirming email:', error.message);
        } else {
          console.log('Email confirmed successfully!');
        }
      }

      console.log('\nResetting password...');
      const { error: pwdError } = await supabase.auth.admin.updateUserById(existing.id, {
        password,
      });
      if (pwdError) {
        console.error('Error resetting password:', pwdError.message);
      } else {
        console.log('Password reset successfully!');
      }
      return;
    }
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log(`User created successfully!`);
  console.log('Email:', data.user.email);
  console.log('ID:', data.user.id);
}

main().catch(console.error);
