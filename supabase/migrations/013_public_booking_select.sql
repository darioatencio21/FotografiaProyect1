-- Allow public SELECT on bookings so clients can view their booking
-- via the approval link without needing auth.
DROP POLICY IF EXISTS "Auth read bookings" ON bookings;
DROP POLICY IF EXISTS "Public read bookings" ON bookings;
CREATE POLICY "Public read bookings" ON bookings
  FOR SELECT TO public
  USING (true);
