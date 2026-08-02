-- =============================================================================
-- Reconciliation migration: bring production RLS/objects in line with the
-- desired final state, closing gaps left by historical manual changes.
--
-- Applied after 014-024 were pushed (2026-08-01). Safe to re-run.
-- =============================================================================

-- 1. instagram_posts: the historical migration (010, renumbered to 024) had
--    re-created the permissive "Admin can manage instagram_posts" policy
--    (TO public, ALL, USING true WITH CHECK true) after 014 removed it, so any
--    anonymous visitor could INSERT/UPDATE/DELETE rows. Drop it for good; the
--    hardened "Auth manage instagram_posts" (TO authenticated) already exists
--    from 014.
DROP POLICY IF EXISTS "Admin can manage instagram_posts" ON instagram_posts;

-- 2. instagram_config: migration 011 left an "Admin can manage instagram_config"
--    policy open to the public anon role (ALL, USING true WITH CHECK true).
--    Replace it with an authenticated-only admin policy. Public read is kept
--    for the widget.
--
--    NOTE (C1 / real admin role): like every other table governed by the
--    "Auth <op> <table>" policies (017 and the ones below), these two rely on
--    the placeholder criterion "authenticated = admin". Pending list for when
--    a real admin role is implemented: instagram_posts, instagram_config, plus
--    all tables in 017 (photographs, services, testimonials, blogposts, faqs,
--    clientaccounts, photography_packages, session_categories, seo, profile,
--    bookingconfig, emailconfig, analytics, invoices, messages, bookings).
DROP POLICY IF EXISTS "Admin can manage instagram_config" ON instagram_config;
CREATE POLICY "Auth manage instagram_config" ON instagram_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. bookings: migrations 012/013 granted table-level SELECT/UPDATE to anon and
--    the default table creation left DELETE/TRUNCATE/REFERENCES/TRIGGER. Their
--    policies were dropped by 014, so the grants are dead — but they are
--    defense-in-depth debt. 021 already revoked INSERT; revoke the rest so the
--    anon role has no table-level privilege on bookings at all.
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON bookings FROM anon;

-- 4. Remove the undocumented tutorial helper (event trigger + SECURITY DEFINER
--    function) that auto-enabled RLS on every new table. It was never in a
--    migration and is no longer needed: every table is governed by explicit
--    policies.
DROP EVENT TRIGGER IF EXISTS ensure_rls;
DROP FUNCTION IF EXISTS public.rls_auto_enable();
