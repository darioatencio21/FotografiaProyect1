-- =============================================================================
-- Security hardening: rate-limit triggers run with definer privileges.
--
-- Root cause of the 401/42501 on anonymous bookings/messages inserts:
--   The BEFORE INSERT triggers (020/021) call enforce_*_rate_limit(), which does
--   an internal SELECT count(*) over bookings/messages to count recent attempts
--   by email. That SELECT ran with the invoker's privileges (SECURITY INVOKER).
--   After 025/027 revoked table-level SELECT from anon, the count(*) fails at
--   the grant level and the whole INSERT fails with 401/42501 — the public
--   booking form and the contact form broke.
--
-- Fix: run both functions as SECURITY DEFINER (owner: postgres, who owns the
-- tables) with a pinned search_path, and switch the role check from
-- current_user to auth.role().
--
-- Why the role check must change:
--   Inside a SECURITY DEFINER function, current_user reports the DEFINER
--   (postgres), not the caller — the old `IF current_user = 'anon'` would
--   silently disable rate limiting for everyone. auth.role() reads the JWT
--   `role` claim set by PostgREST, so it still distinguishes public (anon) from
--   authenticated (admin) requests regardless of the connection role.
--
-- Grants/RLS are NOT touched: anon keeps no table-level SELECT, INSERT only on
-- the whitelisted columns (021/018). This only changes how the trigger's
-- internal COUNT resolves its table access.
-- =============================================================================

-- 1. Messages rate limit (max 5 per email per rolling hour, anon only).
CREATE OR REPLACE FUNCTION public.enforce_messages_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  recent_count bigint;
BEGIN
  IF auth.role() = 'anon' THEN
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
$function$;

-- 2. Bookings rate limit (max 5 per email per rolling hour, anon only).
CREATE OR REPLACE FUNCTION public.enforce_bookings_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  recent_count bigint;
BEGIN
  IF auth.role() = 'anon' THEN
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
$function$;
