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

async function seed() {
  console.log('Seeding analytics...\n');

  const { error } = await supabase.from('analytics').upsert({
    id: 'stats',
    totalVisits: 14890,
    totalRevenue: 64200,
    bookingConversionRate: 4.8,
    sessionsCount: 512,
    revenueByMonth: [
      { month: 'Feb', value: 8500 },
      { month: 'Mar', value: 12400 },
      { month: 'Apr', value: 14500 },
      { month: 'May', value: 18200 },
      { month: 'Jun', value: 24500 },
      { month: 'Jul', value: 31000 }
    ],
    sessionsByService: [
      { service: 'Weddings', count: 18 },
      { service: 'Portraits', count: 42 },
      { service: 'Architectural', count: 12 },
      { service: 'Product', count: 24 }
    ],
    visitsByDay: [
      { day: 'Mon', count: 420 },
      { day: 'Tue', count: 490 },
      { day: 'Wed', count: 520 },
      { day: 'Thu', count: 610 },
      { day: 'Fri', count: 750 },
      { day: 'Sat', count: 880 },
      { day: 'Sun', count: 820 }
    ]
  });

  if (error) {
    console.error('Error seeding analytics:', error.message);
  } else {
    console.log('✓ analytics/stats seeded');
  }

  console.log('\nDone. Create the administrator in Supabase Auth (Authentication > Users > Invite User).');
}

seed().catch(console.error);
