CREATE TABLE IF NOT EXISTS instagram_posts (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  post_url TEXT NOT NULL,
  caption TEXT,
  timestamp TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Hardened final state (matches 014): the admin policy is scoped to
-- authenticated (admin) only, never the public anon role.
DROP POLICY IF EXISTS "Admin can manage instagram_posts" ON instagram_posts;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'instagram_posts'
      AND policyname = 'Public can read instagram_posts'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can read instagram_posts"
      ON instagram_posts FOR SELECT
      USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'instagram_posts'
      AND policyname = 'Auth manage instagram_posts'
  ) THEN
    EXECUTE 'CREATE POLICY "Auth manage instagram_posts"
      ON instagram_posts FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;