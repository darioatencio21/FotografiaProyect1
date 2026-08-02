-- FIX: Public read RLS policies for Supabase (run in SQL Editor)
-- These policies allow the anon key to read public data

-- Public read policies (safe to re-run)
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

DROP POLICY IF EXISTS "Public read emailconfig" ON emailconfig;
CREATE POLICY "Public read emailconfig" ON emailconfig FOR SELECT USING (true);
