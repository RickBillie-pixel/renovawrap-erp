-- Add DELETE policies for authenticated users (admins) to delete leads

-- DELETE policy for contact_requests
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.contact_requests;
CREATE POLICY "Allow authenticated delete" ON public.contact_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- DELETE policy for submissions
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.submissions;
CREATE POLICY "Allow authenticated delete" ON public.submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

