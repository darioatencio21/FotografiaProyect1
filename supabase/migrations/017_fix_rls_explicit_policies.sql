-- =============================================================================
-- Split remaining "Auth write FOR ALL" policies into explicit INSERT/UPDATE/DELETE.
-- This ensures upsert operations check both INSERT and UPDATE policies independently,
-- and makes the RLS setup consistent across all tables for easier auditing.
-- =============================================================================

-- Helper: drop the old FOR ALL policy if it exists, then create per-operation policies
DO $$
DECLARE
  tables_with_old_policy TEXT[] := ARRAY[
    'photographs', 'services', 'testimonials', 'blogposts', 'faqs',
    'clientaccounts', 'photography_packages', 'session_categories',
    'seo', 'profile', 'bookingconfig', 'emailconfig', 'analytics'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_with_old_policy
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Auth write %1$s" ON %1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert %1$s" ON %1$s', t);
    EXECUTE format('CREATE POLICY "Auth insert %1$s" ON %1$s FOR INSERT TO authenticated WITH CHECK (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth update %1$s" ON %1$s', t);
    EXECUTE format('CREATE POLICY "Auth update %1$s" ON %1$s FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth delete %1$s" ON %1$s', t);
    EXECUTE format('CREATE POLICY "Auth delete %1$s" ON %1$s FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END;
$$;
