-- Force create contact-uploads bucket

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

