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

CREATE POLICY "Public can read instagram_posts"
  ON instagram_posts FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage instagram_posts"
  ON instagram_posts FOR ALL
  USING (true)
  WITH CHECK (true);