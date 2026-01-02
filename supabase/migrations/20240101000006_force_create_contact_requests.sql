-- Force create contact_requests table and reload schema cache

-- Drop table if it exists to ensure clean state (be careful with production data, but this is a fix)
-- DROP TABLE IF EXISTS public.contact_requests;

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

-- Re-create indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Re-apply policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_requests;
CREATE POLICY "Allow anonymous inserts" ON public.contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON public.contact_requests;
CREATE POLICY "Allow authenticated read" ON public.contact_requests
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.contact_requests;
CREATE POLICY "Allow authenticated update" ON public.contact_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role read" ON public.contact_requests;
CREATE POLICY "Allow service role read" ON public.contact_requests
  FOR SELECT
  TO service_role
  USING (true);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

