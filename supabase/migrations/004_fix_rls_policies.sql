-- Fix RLS policies for public-facing tables
-- bookings: public can INSERT (booking form), only auth can SELECT/UPDATE/DELETE
DROP POLICY IF EXISTS "Auth write bookings" ON bookings;
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update bookings" ON bookings;
CREATE POLICY "Auth update bookings" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth delete bookings" ON bookings;
CREATE POLICY "Auth delete bookings" ON bookings FOR DELETE USING (auth.role() = 'authenticated');

-- messages: public can INSERT (contact form), only auth can SELECT/UPDATE/DELETE
DROP POLICY IF EXISTS "Auth write messages" ON messages;
DROP POLICY IF EXISTS "Public insert messages" ON messages;
CREATE POLICY "Public insert messages" ON messages FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update messages" ON messages;
CREATE POLICY "Auth update messages" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth delete messages" ON messages;
CREATE POLICY "Auth delete messages" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- emailconfig: public can SELECT (read on startup, like seo/profile/bookingconfig), only auth can write
DROP POLICY IF EXISTS "Auth read emailconfig" ON emailconfig;
DROP POLICY IF EXISTS "Public read emailconfig" ON emailconfig;
CREATE POLICY "Public read emailconfig" ON emailconfig FOR SELECT USING (true);
