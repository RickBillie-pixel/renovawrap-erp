-- Create ad_submissions table for ad landing page configurator
CREATE TABLE IF NOT EXISTS public.ad_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  service_details JSONB,
  color_details JSONB,
  image_url TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL,
  admin_notes TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_ad_submissions_email ON public.ad_submissions(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_ad_submissions_created_at ON public.ad_submissions(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_ad_submissions_status ON public.ad_submissions(status);

-- Enable Row Level Security
ALTER TABLE public.ad_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON public.ad_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow service role to read all ad_submissions
CREATE POLICY "Allow service role read" ON public.ad_submissions
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Allow authenticated users to read all ad_submissions
CREATE POLICY "Allow authenticated read" ON public.ad_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update ad_submissions
CREATE POLICY "Allow authenticated update" ON public.ad_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete ad_submissions
CREATE POLICY "Allow authenticated delete" ON public.ad_submissions
  FOR DELETE
  TO authenticated
  USING (true);
