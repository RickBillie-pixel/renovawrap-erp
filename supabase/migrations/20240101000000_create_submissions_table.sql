-- Create submissions table for configurator
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  service_details JSONB,
  color_details JSONB,
  image_url TEXT NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON public.submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow service role to read all submissions
CREATE POLICY "Allow service role read" ON public.submissions
  FOR SELECT
  TO service_role
  USING (true);

