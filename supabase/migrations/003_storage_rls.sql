-- Storage RLS policies for image uploads
-- Run this in Supabase SQL Editor to allow authenticated users to upload to our buckets

-- Drop existing policies if any (to make this re-runnable)
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Public read access (anyone can view images in our buckets)
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));

-- Authenticated users can upload new images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));

-- Authenticated users can update (overwrite) images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'))
WITH CHECK (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));

-- Authenticated users can delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('photographs', 'proofs', 'profile', 'seo', 'packages', 'session_categories'));
