CREATE TABLE IF NOT EXISTS instagram_config (
  id TEXT PRIMARY KEY DEFAULT 'instagram',
  access_token TEXT NOT NULL DEFAULT '',
  token_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE instagram_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read instagram_config" ON instagram_config;
CREATE POLICY "Public can read instagram_config"
  ON instagram_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage instagram_config" ON instagram_config;
CREATE POLICY "Admin can manage instagram_config"
  ON instagram_config FOR ALL
  USING (true)
  WITH CHECK (true);
