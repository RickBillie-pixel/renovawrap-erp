-- Add CRM columns to submissions table
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

