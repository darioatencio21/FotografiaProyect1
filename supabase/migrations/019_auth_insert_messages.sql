-- =============================================================================
-- FIX: Restore authenticated INSERT on messages (regression from 018).
--
-- Migration 018 dropped every policy on messages and only re-created:
--   - "Anonymous insert messages"   FOR INSERT TO anon
--   - "Authenticated select/update/delete" FOR authenticated
--
-- That left the authenticated (admin) role with NO INSERT policy. PostgREST
-- upserts (INSERT ... ON CONFLICT (id) DO UPDATE) therefore fail with
-- "42501 new row violates row-level security policy" whenever an admin marks a
-- message as read, replies, or persists the HTML-entity migration — the
-- INSERT branch of the upsert is rejected before the UPDATE branch is reached.
--
-- After:  anon keeps INSERT-only (public contact form), authenticated gets
--         full INSERT/UPDATE/SELECT/DELETE as before 018.
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated insert messages" ON messages;
CREATE POLICY "Authenticated insert messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
