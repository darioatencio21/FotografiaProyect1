-- =============================================================================
-- Tighten contact-form field limits (frontend now enforces: name ≤20,
-- subject ≤100, message ≤500). Mirrors the new frontend constants so the
-- RLS WITH CHECK and the UI stay in sync.
--
-- Policy is dropped and recreated idempotently — safe to re-run.
-- =============================================================================

-- 1. Drop the existing anon INSERT policy on messages.
DROP POLICY IF EXISTS "Anonymous insert messages" ON messages;

-- 2. Recreate with tighter limits.
CREATE POLICY "Anonymous insert messages" ON messages
  FOR INSERT TO anon
  WITH CHECK (
    name IS NOT NULL
    AND char_length(name) BETWEEN 1 AND 20
    AND email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(email) <= 150
    AND subject IS NOT NULL
    AND char_length(subject) BETWEEN 1 AND 100
    AND message IS NOT NULL
    AND char_length(message) BETWEEN 10 AND 500
  );
