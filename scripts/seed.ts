import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`Missing ${v}. Create a .env.local file with your Firebase config.`);
    process.exit(1);
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const seedApp = initializeApp(firebaseConfig);
const db = getFirestore(seedApp);

async function seed() {
  console.log('Seeding Firestore...\n');

  await setDoc(doc(db, 'analytics', 'stats'), {
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
  }, { merge: true });
  console.log('✓ analytics/stats created');

  console.log('\nDone. Create the administrator in Firebase Authentication.');
}

seed().catch(console.error);
