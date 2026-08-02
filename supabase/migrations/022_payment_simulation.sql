-- =============================================================================
-- Support the server-side payment simulation (simulate-payment edge function).
--
-- Adds a paymentProvider column to bookings (records which provider settled the
-- payment) and a payment_attempts table used to rate-limit payment attempts per
-- booking (max 3 per hour) so the endpoint cannot be spammed.
-- =============================================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS payment_attempts (
  booking_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_booking_created
  ON payment_attempts (booking_id, created_at);
