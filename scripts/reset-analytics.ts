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

async function reset() {
  console.log('Resetting bookings and analytics...\n');

  const { error: err1 } = await supabase.from('bookings').delete().neq('id', '');
  console.log(`Deleted bookings: ${err1 ? 'Error: ' + err1.message : 'ok'}`);

  const { error: err2 } = await supabase.from('analytics').upsert({
    id: 'stats',
    totalVisits: 0,
    totalRevenue: 0,
    bookingConversionRate: 0,
    sessionsCount: 0,
    revenueByMonth: [],
    sessionsByService: [],
    visitsByDay: [
      { day: 'Mon', count: 0 }, { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 }, { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 }
    ]
  });

  if (err2) {
    console.error('Error resetting analytics:', err2.message);
  } else {
    console.log('✓ analytics/stats reset to zero');
  }

  console.log('\nDone. Refresh the admin dashboard to see zeroed metrics.');
}

reset().catch(console.error);
