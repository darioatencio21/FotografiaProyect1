-- =============================================================================
-- Restore anonymous INSERT on bookings (public booking form) with strict
-- server-side validation — mirrors migration 018 (messages).
--
-- Context:
--   Migration 020 restricted bookings INSERT to authenticated only, which
--   broke the public booking form for anonymous visitors (clients without an
--   account). Anonymous visitors must be able to submit a booking request.
--
-- Security model (same pattern as messages / 018):
--   1. Anon INSERT policy with a strict WITH CHECK that validates every public
--      field (lengths, email regex, ranges) and FORCES the admin fields
--      (status/isPaid/paymentStatus/contractStatus/...) to their defaults.
--   2. Column-level grants: anon may only INSERT the public-form columns. Any
--      admin/internal column (status, isPaid, paymentStatus, signatures,
--      approval tokens, ...) is not grantable, so the client can never set it —
--      the DB default always applies.
--   3. Rate limiting: max 5 booking inserts per email per rolling hour,
--      enforced for the anon role only (same trigger pattern as messages).
--
-- UPDATE/DELETE policies on bookings are intentionally NOT touched: they stay
-- restricted to authenticated (admin).
-- =============================================================================

-- 1. Drop the old permissive "TO public WITH CHECK (true)" policy if present,
--    and the anonymous policy from an earlier partial run.
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;
DROP POLICY IF EXISTS "Anonymous insert bookings" ON bookings;

-- 2. Anonymous INSERT policy. WITH CHECK runs on the FINAL row (after column
--    defaults are applied), so the admin fields below are asserted against
--    their default values — a crafted client cannot smuggle a non-default
--    status/payment flag even if the column grant is later widened.
CREATE POLICY "Anonymous insert bookings" ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (
    "clientName" IS NOT NULL
    AND char_length("clientName") BETWEEN 1 AND 100
    AND "clientEmail" IS NOT NULL
    AND "clientEmail" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length("clientEmail") <= 150
    AND ("clientPhone" IS NULL OR char_length("clientPhone") <= 30)
    AND date IS NOT NULL
    AND char_length(date) BETWEEN 1 AND 20
    AND "timeSlot" IS NOT NULL
    AND char_length("timeSlot") BETWEEN 1 AND 120
    AND "serviceId" IS NOT NULL
    AND char_length("serviceId") <= 100
    AND "peopleCount" IS NOT NULL
    AND "peopleCount" BETWEEN 1 AND 100
    AND (notes IS NULL OR char_length(notes) <= 2000)
    AND ("createdAt" IS NULL OR char_length("createdAt") <= 40)
    AND status = 'pending'
    AND "isRead" = false
    AND "isPaid" = false
    AND "paymentStatus" = 'pending'
    AND "contractStatus" = 'pending'
    AND "contractAccepted" = false
    AND "reminderSent" = false
    AND ("packageName" IS NULL OR char_length("packageName") <= 200)
    AND ("packageDetails" IS NULL OR char_length("packageDetails") <= 1000)
    AND "contractType" IN ('session', 'wedding')
    AND ("contractData" IS NULL OR jsonb_typeof("contractData") = 'object')
    AND (amount IS NULL OR (amount >= 0 AND amount <= 100000))
    AND ("depositAmount" IS NULL OR "depositAmount" >= 0)
    AND ("amountDue" IS NULL OR "amountDue" >= 0)
  );

-- 3. Authenticated (admin) INSERT stays enabled (restored by 020, kept here
--    idempotently so the migration is safe to re-run).
DROP POLICY IF EXISTS "Authenticated insert bookings" ON bookings;
CREATE POLICY "Authenticated insert bookings" ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Column guard for anon (same technique as 018): revoke table-level INSERT
--    and grant INSERT back ONLY on the public-form columns.
REVOKE INSERT ON bookings FROM anon;
GRANT INSERT (
  id,
  "clientName",
  "clientEmail",
  "clientPhone",
  date,
  "timeSlot",
  "serviceId",
  "peopleCount",
  notes,
  "createdAt",
  amount,
  "depositAmount",
  "amountDue",
  "packageName",
  "packageDetails",
  "contractType",
  "contractData"
) ON bookings TO anon;

-- 5. Rate limit: max 5 anonymous booking inserts per email per rolling hour.
--    Enforced only for the anon role; authenticated (admin) inserts are never
--    blocked. Window uses created_at (server clock).
CREATE OR REPLACE FUNCTION enforce_bookings_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  recent_count bigint;
BEGIN
  IF current_user = 'anon' THEN
    SELECT count(*)
      INTO recent_count
      FROM bookings
      WHERE lower("clientEmail") = lower(NEW."clientEmail")
        AND created_at >= now() - interval '1 hour';
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'rate_limit_exceeded: too many booking requests from this email. Try again later.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_rate_limit ON bookings;
CREATE TRIGGER bookings_rate_limit
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_bookings_rate_limit();
