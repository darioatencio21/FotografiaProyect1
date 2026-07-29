-- =============================================================================
-- Create email_rate_limits table for rate-limiting anonymous email sending
-- via the send-email Edge Function.
--
-- Admins (JWT-authenticated) bypass this limit.
-- Anonymous requests: max 5 emails per IP per hour.
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_rate_limits_ip_created
  ON email_rate_limits (ip_address, created_at);
