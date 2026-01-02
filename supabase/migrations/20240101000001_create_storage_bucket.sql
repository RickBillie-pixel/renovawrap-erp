-- Create storage bucket for configurator uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'configurator-uploads',
  'configurator-uploads',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anonymous uploads
CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'configurator-uploads');

-- Policy: Allow public reads
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'configurator-uploads');

-- Policy: Allow anonymous deletes (optional, for cleanup)
CREATE POLICY "Allow anonymous deletes" ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'configurator-uploads');

