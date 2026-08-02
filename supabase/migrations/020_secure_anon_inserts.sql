-- =============================================================================
-- Harden anonymous INSERT paths (bookings + messages rate limiting).
--
-- Bookings:
--   Before: "Public insert bookings" (TO public, WITH CHECK (true)) allowed any
--           visitor to write arbitrary rows AND arbitrary admin columns
--           (amount, contractData, paymentStatus, approvalToken, ...) straight
--           through the public API key. The public booking form never persists
--           to Supabase (it is local React state only — saveDocument blocks all
--           anonymous writes), so there is no legitimate anonymous insert path.
--   After:  anonymous INSERT on bookings is removed entirely. Only authenticated
--           (admin) can insert, which keeps the admin panel upserts working.
--
-- Messages:
--   Column-level RLS validation already exists (018). This adds a server-side
--   rate limit so an anonymous caller cannot flood the contact form from many
--   IPs using a rotating address set.
-- =============================================================================

-- 1. Bookings: drop the permissive anonymous/public INSERT policy.
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;

-- 2. Bookings: authenticated (admin) keeps INSERT so upserts keep working
--    (same regression fix pattern as migration 019 for messages).
DROP POLICY IF EXISTS "Authenticated insert bookings" ON bookings;
CREATE POLICY "Authenticated insert bookings" ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Bookings: revoke table-level INSERT from anon as defense in depth, so a
--    stray permissive policy can never become effective without restoring the
--    grant too.
REVOKE INSERT ON bookings FROM anon;

-- 4. Messages: rate-limit anonymous inserts (max 5 per email per rolling hour).
--    Enforced only for the anon role; authenticated (admin) upserts are never
--    blocked. Window uses created_at (server clock) not the client-supplied
--    "createdAt" TEXT column.
CREATE OR REPLACE FUNCTION enforce_messages_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  recent_count bigint;
BEGIN
  IF current_user = 'anon' THEN
    SELECT count(*)
      INTO recent_count
      FROM messages
      WHERE lower(email) = lower(NEW.email)
        AND created_at >= now() - interval '1 hour';
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'rate_limit_exceeded: too many messages from this email. Try again later.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_rate_limit ON messages;
CREATE TRIGGER messages_rate_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_messages_rate_limit();
