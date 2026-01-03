-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Basic info (from lead)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  
  -- Lead source info
  lead_source TEXT, -- 'configurator' or 'contact_form'
  lead_id UUID, -- Reference to original lead (submissions or contact_requests)
  
  -- Project details
  project_type TEXT, -- 'keuken', 'interieur', 'zakelijk'
  service_details JSONB, -- From configurator
  color_details JSONB, -- From configurator
  message TEXT, -- From contact form
  
  -- Media
  photo_urls TEXT[] DEFAULT '{}', -- Array of photo URLs
  image_url TEXT, -- From configurator
  
  -- CRM fields
  status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'archived'
  admin_notes TEXT,
  
  -- Additional fields
  appointments JSONB DEFAULT '[]', -- Array of appointment objects
  additional_info JSONB DEFAULT '{}' -- Flexible JSON for extra data
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON public.customers(lead_id);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins) to read all customers
CREATE POLICY "Allow authenticated read" ON public.customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users (admins) to insert customers
CREATE POLICY "Allow authenticated insert" ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users (admins) to update customers
CREATE POLICY "Allow authenticated update" ON public.customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users (admins) to delete customers
CREATE POLICY "Allow authenticated delete" ON public.customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Policy: Allow service role to read all customers
CREATE POLICY "Allow service role read" ON public.customers
  FOR SELECT
  TO service_role
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

