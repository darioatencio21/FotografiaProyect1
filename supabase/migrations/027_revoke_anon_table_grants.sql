-- =============================================================================
-- Reconciliation migration: remove the last dead public-role table grants.
--
-- Applied after 025 (bookings). The frontend never reads or writes these three
-- tables anonymously:
--   - anonymous reads are gated in src/lib/db.ts (ADMIN_ONLY_TABLES) and return
--     the fallback without firing a SELECT;
--   - anonymous writes are allow-listed per table in ANON_INSERT_TABLES.
-- RLS already blocks every row, so the grants are defense-in-depth debt — but
-- the invoices INSERT grant + policy was also an open hole. Safe to re-run.
-- =============================================================================

-- 1. messages: revoke the table-level SELECT/UPDATE/DELETE/TRUNCATE/
--    REFERENCES/TRIGGER grants left from the default table creation. The
--    column-level INSERT grant from 018 (id, name, email, subject, message,
--    "createdAt", "isRead") is preserved: it is what the anonymous contact form
--    uses, and its RLS policy ("Anonymous insert messages") is the allow-list.
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON messages FROM anon;

-- 2. clientaccounts: nothing public touches this table (no policies for anon,
--    no frontend anon reads/writes). Revoke every table-level privilege.
REVOKE ALL ON clientaccounts FROM anon;

-- 3. invoices: same as clientaccounts for the grants, plus the public INSERT
--    policy. "Public insert invoices" (005) was FOR INSERT WITH CHECK (true)
--    with no column restriction — combined with the anon INSERT grant it let
--    anyone insert arbitrary invoice rows via the anon key. The frontend never
--    inserts invoices anonymously (admin-only, saveDocument requires a session),
--    so it is dead code. Drop it.
DROP POLICY IF EXISTS "Public insert invoices" ON invoices;
REVOKE ALL ON invoices FROM anon;
