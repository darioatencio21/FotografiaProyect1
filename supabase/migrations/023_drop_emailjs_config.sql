-- =============================================================================
-- Remove legacy EmailJS configuration columns from emailconfig.
--
-- All email sending has been migrated to the send-email Edge Function (Resend).
-- EmailJS is not used anywhere in the codebase; these columns were only ever
-- read/written by the (now removed) admin UI fields.
-- =============================================================================

ALTER TABLE emailconfig DROP COLUMN IF EXISTS "emailjsServiceId";
ALTER TABLE emailconfig DROP COLUMN IF EXISTS "emailjsTemplateId";
ALTER TABLE emailconfig DROP COLUMN IF EXISTS "emailjsPublicKey";
ALTER TABLE emailconfig DROP COLUMN IF EXISTS "emailjsPrivateKey";
ALTER TABLE emailconfig DROP COLUMN IF EXISTS "emailjsAutoTemplateId";
