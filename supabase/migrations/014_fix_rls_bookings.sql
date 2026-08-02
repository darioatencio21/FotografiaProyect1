-- =============================================================================
-- FIX: Remove public SELECT/UPDATE from bookings (CRITICAL security fix)
-- 
-- Before: Public could SELECT and UPDATE ALL bookings — massive data exposure
-- After:  Only authenticated (admin) can SELECT/UPDATE bookings.
--         Public can still INSERT (booking form).
--         Approval flow now uses Edge Functions (verify-approval, update-booking-status)
--         with service_role, so direct public access is no longer needed.
-- =============================================================================

-- 1. Remove the dangerously permissive public policies
DROP POLICY IF EXISTS "Public read bookings" ON bookings;
DROP POLICY IF EXISTS "Public update bookings" ON bookings;

-- 2. Reinstate auth-only policies (these already existed before 012/013)
DROP POLICY IF EXISTS "Auth read bookings" ON bookings;
CREATE POLICY "Auth read bookings" ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Auth update bookings" ON bookings;
CREATE POLICY "Auth update bookings" ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Keep public INSERT (so clients can submit booking requests)
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;
CREATE POLICY "Public insert bookings" ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 4. Delete only by authenticated users
DROP POLICY IF EXISTS "Auth delete bookings" ON bookings;
CREATE POLICY "Auth delete bookings" ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- Fix instagram_posts: remove dangerously permissive admin policy
-- =============================================================================
DROP POLICY IF EXISTS "Admin can manage instagram_posts" ON instagram_posts;
DROP POLICY IF EXISTS "Auth manage instagram_posts" ON instagram_posts;
CREATE POLICY "Auth manage instagram_posts" ON instagram_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can still read instagram_posts
DROP POLICY IF EXISTS "Public can read instagram_posts" ON instagram_posts;
CREATE POLICY "Public can read instagram_posts" ON instagram_posts
  FOR SELECT
  TO public
  USING (true);