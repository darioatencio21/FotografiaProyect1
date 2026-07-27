-- Photographs gallery
CREATE TABLE IF NOT EXISTS photographs (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  title_es TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  exif JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isFavorite" BOOLEAN DEFAULT false,
  "isFeatured" BOOLEAN DEFAULT false,
  rating INTEGER,
  downloads INTEGER,
  size TEXT DEFAULT '',
  resolution TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photography services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  includes TEXT[] DEFAULT ARRAY[]::TEXT[],
  includes_es TEXT[] DEFAULT ARRAY[]::TEXT[],
  includes_en TEXT[] DEFAULT ARRAY[]::TEXT[],
  price REAL NOT NULL DEFAULT 0,
  slug TEXT NOT NULL DEFAULT '',
  image TEXT DEFAULT '',
  title_es TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  duration_es TEXT DEFAULT '',
  duration_en TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blogposts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image TEXT DEFAULT '',
  date TEXT DEFAULT '',
  "readTime" TEXT DEFAULT '',
  "seoKeywords" TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL DEFAULT '',
  answer TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT '',
  question_es TEXT DEFAULT '',
  answer_es TEXT DEFAULT '',
  question_en TEXT DEFAULT '',
  answer_en TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  "clientName" TEXT NOT NULL DEFAULT '',
  "clientEmail" TEXT NOT NULL DEFAULT '',
  "clientPhone" TEXT DEFAULT '',
  date TEXT DEFAULT '',
  "timeSlot" TEXT DEFAULT '',
  "serviceId" TEXT DEFAULT '',
  "peopleCount" INTEGER DEFAULT 1,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  "createdAt" TEXT DEFAULT '',
  amount REAL,
  "isRead" BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  "createdAt" TEXT DEFAULT '',
  "isRead" BOOLEAN DEFAULT false,
  "replyText" TEXT DEFAULT '',
  "replyAt" TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Client accounts (proofing galleries)
CREATE TABLE IF NOT EXISTS clientaccounts (
  id TEXT PRIMARY KEY,
  "clientName" TEXT DEFAULT '',
  "clientEmail" TEXT DEFAULT '',
  passcode TEXT DEFAULT '',
  "sessionDate" TEXT DEFAULT '',
  "sessionTitle" TEXT DEFAULT '',
  photos JSONB DEFAULT '[]'::jsonb,
  "createdAt" TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photography packages
CREATE TABLE IF NOT EXISTS photography_packages (
  id TEXT PRIMARY KEY,
  category TEXT DEFAULT '',
  name_es TEXT DEFAULT '',
  name_en TEXT DEFAULT '',
  image TEXT DEFAULT '',
  price REAL DEFAULT 0,
  "priceFromText_es" TEXT DEFAULT '',
  "priceFromText_en" TEXT DEFAULT '',
  duration_es TEXT DEFAULT '',
  duration_en TEXT DEFAULT '',
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  benefits_es TEXT[] DEFAULT ARRAY[]::TEXT[],
  benefits_en TEXT[] DEFAULT ARRAY[]::TEXT[],
  "buttonText_es" TEXT DEFAULT '',
  "buttonText_en" TEXT DEFAULT '',
  "travelNote_es" TEXT DEFAULT '',
  "travelNote_en" TEXT DEFAULT '',
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Session categories
CREATE TABLE IF NOT EXISTS session_categories (
  id TEXT PRIMARY KEY,
  icon TEXT DEFAULT '',
  name_es TEXT DEFAULT '',
  name_en TEXT DEFAULT '',
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  image TEXT DEFAULT '',
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SEO singleton (id = 'config')
CREATE TABLE IF NOT EXISTS seo (
  id TEXT PRIMARY KEY DEFAULT 'config',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  "ogTitle" TEXT DEFAULT '',
  "ogDescription" TEXT DEFAULT '',
  "ogImage" TEXT DEFAULT '',
  "twitterCard" TEXT DEFAULT 'summary_large_image',
  keywords TEXT DEFAULT '',
  "robotsText" TEXT DEFAULT '',
  "heroImageLeft" TEXT DEFAULT '',
  "heroImageRight" TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO seo (id) VALUES ('config') ON CONFLICT (id) DO NOTHING;

-- Photographer profile singleton (id = 'photographer')
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY DEFAULT 'photographer',
  name TEXT DEFAULT '',
  "avatarUrl" TEXT DEFAULT '',
  title TEXT DEFAULT '',
  "preferredCamera" TEXT DEFAULT '',
  "preferredLens" TEXT DEFAULT '',
  "aboutTitle_es" TEXT DEFAULT '',
  "aboutTitle_en" TEXT DEFAULT '',
  "aboutText1_es" TEXT DEFAULT '',
  "aboutText2_es" TEXT DEFAULT '',
  "aboutText1_en" TEXT DEFAULT '',
  "aboutText2_en" TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO profile (id) VALUES ('photographer') ON CONFLICT (id) DO NOTHING;

-- Booking config singleton (id = 'config')
CREATE TABLE IF NOT EXISTS bookingconfig (
  id TEXT PRIMARY KEY DEFAULT 'config',
  "timeSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "availableDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  "blockedDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO bookingconfig (id) VALUES ('config') ON CONFLICT (id) DO NOTHING;

-- Email config singleton (id = 'config')
CREATE TABLE IF NOT EXISTS emailconfig (
  id TEXT PRIMARY KEY DEFAULT 'config',
  "emailjsServiceId" TEXT DEFAULT '',
  "emailjsTemplateId" TEXT DEFAULT '',
  "emailjsPublicKey" TEXT DEFAULT '',
  "receiverEmail" TEXT DEFAULT '',
  "enableAutoResponse" BOOLEAN DEFAULT false,
  "emailjsAutoTemplateId" TEXT DEFAULT '',
  "autoReplySubject" TEXT DEFAULT '',
  "autoReplyMessage" TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO emailconfig (id) VALUES ('config') ON CONFLICT (id) DO NOTHING;

-- Analytics stats singleton (id = 'stats')
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY DEFAULT 'stats',
  "totalVisits" INTEGER DEFAULT 0,
  "totalRevenue" REAL DEFAULT 0,
  "bookingConversionRate" REAL DEFAULT 0,
  "sessionsCount" INTEGER DEFAULT 0,
  "revenueByMonth" JSONB DEFAULT '[]'::jsonb,
  "sessionsByService" JSONB DEFAULT '[]'::jsonb,
  "visitsByDay" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO analytics (id) VALUES ('stats') ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE photographs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientaccounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photography_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookingconfig ENABLE ROW LEVEL SECURITY;
ALTER TABLE emailconfig ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public read photographs" ON photographs;
CREATE POLICY "Public read photographs" ON photographs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read testimonials" ON testimonials;
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read blogposts" ON blogposts;
CREATE POLICY "Public read blogposts" ON blogposts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read faqs" ON faqs;
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read photography_packages" ON photography_packages;
CREATE POLICY "Public read photography_packages" ON photography_packages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read session_categories" ON session_categories;
CREATE POLICY "Public read session_categories" ON session_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read seo" ON seo;
CREATE POLICY "Public read seo" ON seo FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read profile" ON profile;
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read bookingconfig" ON bookingconfig;
CREATE POLICY "Public read bookingconfig" ON bookingconfig FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read analytics" ON analytics;
CREATE POLICY "Public read analytics" ON analytics FOR SELECT USING (true);

-- Auth required for sensitive collections
DROP POLICY IF EXISTS "Auth read bookings" ON bookings;
CREATE POLICY "Auth read bookings" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth read messages" ON messages;
CREATE POLICY "Auth read messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth read clientaccounts" ON clientaccounts;
CREATE POLICY "Auth read clientaccounts" ON clientaccounts FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth read emailconfig" ON emailconfig;
CREATE POLICY "Auth read emailconfig" ON emailconfig FOR SELECT USING (auth.role() = 'authenticated');

-- Auth required for all writes
DROP POLICY IF EXISTS "Auth write photographs" ON photographs;
CREATE POLICY "Auth write photographs" ON photographs FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write services" ON services;
CREATE POLICY "Auth write services" ON services FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write testimonials" ON testimonials;
CREATE POLICY "Auth write testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write blogposts" ON blogposts;
CREATE POLICY "Auth write blogposts" ON blogposts FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write faqs" ON faqs;
CREATE POLICY "Auth write faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write bookings" ON bookings;
CREATE POLICY "Auth write bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write messages" ON messages;
CREATE POLICY "Auth write messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write clientaccounts" ON clientaccounts;
CREATE POLICY "Auth write clientaccounts" ON clientaccounts FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write photography_packages" ON photography_packages;
CREATE POLICY "Auth write photography_packages" ON photography_packages FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write session_categories" ON session_categories;
CREATE POLICY "Auth write session_categories" ON session_categories FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write seo" ON seo;
CREATE POLICY "Auth write seo" ON seo FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write profile" ON profile;
CREATE POLICY "Auth write profile" ON profile FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write bookingconfig" ON bookingconfig;
CREATE POLICY "Auth write bookingconfig" ON bookingconfig FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write emailconfig" ON emailconfig;
CREATE POLICY "Auth write emailconfig" ON emailconfig FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth write analytics" ON analytics;
CREATE POLICY "Auth write analytics" ON analytics FOR ALL USING (auth.role() = 'authenticated');

-- Storage RLS policies (for image uploads)
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));

DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'))
WITH CHECK (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));

DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));
