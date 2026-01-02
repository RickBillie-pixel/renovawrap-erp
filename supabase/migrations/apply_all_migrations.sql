-- Combined migration script to apply all new migrations
-- This script combines all migrations for easy execution

-- ============================================
-- Migration: Create contact_requests table
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT NOT NULL, -- 'keuken', 'interieur', 'zakelijk'
  message TEXT,
  photo_urls TEXT[] DEFAULT '{}', -- Array of photo URLs
  status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'in_progress', 'completed', 'archived'
  admin_notes TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);

-- Enable Row Level Security
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for form submissions)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_requests;
CREATE POLICY "Allow anonymous inserts" ON public.contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users (admins) to read all contact requests
DROP POLICY IF EXISTS "Allow authenticated read" ON public.contact_requests;
CREATE POLICY "Allow authenticated read" ON public.contact_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users (admins) to update contact requests
DROP POLICY IF EXISTS "Allow authenticated update" ON public.contact_requests;
CREATE POLICY "Allow authenticated update" ON public.contact_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow service role to read all contact requests
DROP POLICY IF EXISTS "Allow service role read" ON public.contact_requests;
CREATE POLICY "Allow service role read" ON public.contact_requests
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- Migration: Add CRM columns to submissions
-- ============================================
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' NOT NULL,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- Update RLS policies to allow authenticated users to update submissions
DROP POLICY IF EXISTS "Allow authenticated read" ON public.submissions;
CREATE POLICY "Allow authenticated read" ON public.submissions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.submissions;
CREATE POLICY "Allow authenticated update" ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Migration: Create contact-uploads bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-uploads', 'contact-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads to contact-uploads bucket
DROP POLICY IF EXISTS "Allow anonymous uploads contact-uploads" ON storage.objects;
CREATE POLICY "Allow anonymous uploads contact-uploads" ON storage.objects
  FOR INSERT
  TO anon
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

-- ============================================
-- Migration: Allow anonymous select on submissions
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous select" ON public.submissions;
CREATE POLICY "Allow anonymous select" ON public.submissions
  FOR SELECT
  TO anon
  USING (true);

