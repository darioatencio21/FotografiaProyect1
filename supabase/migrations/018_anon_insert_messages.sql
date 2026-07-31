-- =============================================================================
-- Harden messages RLS: anonymous users may only INSERT (public contact form).
--
-- Before: the live database allowed anon SELECT/UPDATE on messages (stale
--         policies and/or RLS disabled). This exposed visitor PII.
-- After:  anon can only INSERT rows matching the public form's fields.
--         SELECT/UPDATE/DELETE are restricted to authenticated (admin).
-- =============================================================================

-- 1. Make sure RLS is enabled (some environments had it disabled).
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop every existing policy on messages so no stale/permissive policy survives.
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'messages' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON messages', p.policyname);
  END LOOP;
END $$;

-- 3. Anon: INSERT only. WITH CHECK mirrors the front-end validation so the
--    public form cannot push admin-only fields or junk rows. The check also
--    runs on defaults, so a missing required column (''/NULL) is rejected.
CREATE POLICY "Anonymous insert messages" ON messages
  FOR INSERT TO anon
  WITH CHECK (
    name IS NOT NULL
    AND char_length(name) BETWEEN 1 AND 100
    AND email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(email) <= 150
    AND subject IS NOT NULL
    AND char_length(subject) BETWEEN 1 AND 150
    AND message IS NOT NULL
    AND char_length(message) BETWEEN 10 AND 2000
  );

-- 4. Authenticated (admin) can SELECT/UPDATE/DELETE.
CREATE POLICY "Authenticated select messages" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated update messages" ON messages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete messages" ON messages
  FOR DELETE TO authenticated USING (true);

-- 5. Column guard for anon. A plain column-level REVOKE cannot override the
--    table-level grant in Postgres, so revoke INSERT at table level and grant
--    INSERT back only on the columns the public form may send.
REVOKE INSERT ON messages FROM anon;
GRANT INSERT (id, name, email, subject, message, "createdAt", "isRead") ON messages TO anon;
