-- Create contact_requests table for contact form submissions
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
CREATE POLICY "Allow anonymous inserts" ON public.contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users (admins) to read all contact requests
CREATE POLICY "Allow authenticated read" ON public.contact_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users (admins) to update contact requests
CREATE POLICY "Allow authenticated update" ON public.contact_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow service role to read all contact requests
CREATE POLICY "Allow service role read" ON public.contact_requests
  FOR SELECT
  TO service_role
  USING (true);

