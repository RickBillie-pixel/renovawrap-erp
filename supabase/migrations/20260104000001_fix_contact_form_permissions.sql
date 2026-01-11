-- Fix RLS and storage policies to allow anonymous users to use contact form
-- This ensures everyone can submit contact requests and upload photos

-- 1. Ensure contact_requests table exists and has correct RLS policies
ALTER TABLE IF EXISTS public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Drop and recreate anonymous insert policy for contact_requests
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_requests;
CREATE POLICY "Allow anonymous inserts" ON public.contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow public role (for broader compatibility)
DROP POLICY IF EXISTS "Allow public inserts" ON public.contact_requests;
CREATE POLICY "Allow public inserts" ON public.contact_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 2. Ensure contact-uploads bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-uploads',
  'contact-uploads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- 3. Fix storage policies for contact-uploads bucket
-- Allow anonymous uploads to contact-uploads bucket
DROP POLICY IF EXISTS "Allow anonymous uploads contact-uploads" ON storage.objects;
CREATE POLICY "Allow anonymous uploads contact-uploads" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'contact-uploads');

-- Also allow public role for uploads
DROP POLICY IF EXISTS "Allow public uploads contact-uploads" ON storage.objects;
CREATE POLICY "Allow public uploads contact-uploads" ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'contact-uploads');

-- Allow public read access to contact-uploads bucket
DROP POLICY IF EXISTS "Allow public read contact-uploads" ON storage.objects;
CREATE POLICY "Allow public read contact-uploads" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'contact-uploads');

-- Allow authenticated users to read all files
DROP POLICY IF EXISTS "Allow authenticated read contact-uploads" ON storage.objects;
CREATE POLICY "Allow authenticated read contact-uploads" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'contact-uploads');

-- Allow authenticated users to delete files (for admin cleanup)
DROP POLICY IF EXISTS "Allow authenticated delete contact-uploads" ON storage.objects;
CREATE POLICY "Allow authenticated delete contact-uploads" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'contact-uploads');

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

