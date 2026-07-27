-- Allow public UPDATE on bookings so clients can confirm their booking
-- (sign contract + pay deposit) via the approval link without needing auth.
DROP POLICY IF EXISTS "Auth update bookings" ON bookings;
DROP POLICY IF EXISTS "Public update bookings" ON bookings;
CREATE POLICY "Public update bookings" ON bookings
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);
