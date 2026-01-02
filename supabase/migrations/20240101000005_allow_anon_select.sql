-- Allow anonymous users to select from submissions table
-- This is required for the frontend to poll for the result_url and receive realtime updates
DROP POLICY IF EXISTS "Allow anonymous select" ON public.submissions;
CREATE POLICY "Allow anonymous select" ON public.submissions
  FOR SELECT
  TO anon
  USING (true);

