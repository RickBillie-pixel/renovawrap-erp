-- Restoration script to ensure all tables and objects exist
-- This is safe to run even if tables exist (IF NOT EXISTS)

-- 1. Contact Requests Table
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

-- Indexes for contact_requests
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);

-- RLS for contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_requests;
CREATE POLICY "Allow anonymous inserts" ON public.contact_requests FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON public.contact_requests;
CREATE POLICY "Allow authenticated read" ON public.contact_requests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.contact_requests;
CREATE POLICY "Allow authenticated update" ON public.contact_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role read" ON public.contact_requests;
CREATE POLICY "Allow service role read" ON public.contact_requests FOR SELECT TO service_role USING (true);


-- 2. Submissions Table (Configurator) - Ensure it exists and has columns
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

-- Ensure CRM columns exist on submissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'status') THEN
        ALTER TABLE public.submissions ADD COLUMN status TEXT DEFAULT 'new' NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.submissions ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- RLS for submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.submissions;
CREATE POLICY "Allow anonymous inserts" ON public.submissions FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role read" ON public.submissions;
CREATE POLICY "Allow service role read" ON public.submissions FOR SELECT TO service_role USING (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON public.submissions;
CREATE POLICY "Allow authenticated read" ON public.submissions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.submissions;
CREATE POLICY "Allow authenticated update" ON public.submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select" ON public.submissions;
CREATE POLICY "Allow anonymous select" ON public.submissions FOR SELECT TO anon USING (true);


-- 3. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('contact-uploads', 'contact-uploads', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('configurator-uploads', 'configurator-uploads', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Contact Uploads
DROP POLICY IF EXISTS "Allow anonymous uploads contact-uploads" ON storage.objects;
CREATE POLICY "Allow anonymous uploads contact-uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'contact-uploads');

DROP POLICY IF EXISTS "Allow public read contact-uploads" ON storage.objects;
CREATE POLICY "Allow public read contact-uploads" ON storage.objects FOR SELECT TO public USING (bucket_id = 'contact-uploads');

DROP POLICY IF EXISTS "Allow authenticated read contact-uploads" ON storage.objects;
CREATE POLICY "Allow authenticated read contact-uploads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'contact-uploads');


-- Storage Policies: Configurator Uploads
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
CREATE POLICY "Allow anonymous uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'configurator-uploads');

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT TO public USING (bucket_id = 'configurator-uploads');


-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

