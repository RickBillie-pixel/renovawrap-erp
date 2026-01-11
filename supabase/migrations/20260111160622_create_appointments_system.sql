-- =====================================================
-- Appointments System Migration
-- =====================================================

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL DEFAULT 'afspraak', -- afspraak/herinnering/follow_up
  date DATE NOT NULL,
  time TIME,
  status TEXT NOT NULL DEFAULT 'gepland', -- gepland/voltooid/geannuleerd
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address TEXT,
  contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON public.appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON public.appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments(created_at DESC);

-- Enable Row Level Security for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
DROP POLICY IF EXISTS "Allow authenticated read appointments" ON public.appointments;
CREATE POLICY "Allow authenticated read appointments" ON public.appointments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert appointments" ON public.appointments;
CREATE POLICY "Allow authenticated insert appointments" ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update appointments" ON public.appointments;
CREATE POLICY "Allow authenticated update appointments" ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete appointments" ON public.appointments;
CREATE POLICY "Allow authenticated delete appointments" ON public.appointments
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service role full access appointments" ON public.appointments;
CREATE POLICY "Allow service role full access appointments" ON public.appointments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp for appointments
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- =====================================================
-- Appointment Reminders Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'gepland', -- gepland/verzonden/geannuleerd
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for appointment_reminders
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON public.appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_date ON public.appointment_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status ON public.appointment_reminders(status);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_date_status ON public.appointment_reminders(reminder_date, status);

-- Enable Row Level Security for appointment_reminders
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointment_reminders
DROP POLICY IF EXISTS "Allow authenticated read reminders" ON public.appointment_reminders;
CREATE POLICY "Allow authenticated read reminders" ON public.appointment_reminders
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert reminders" ON public.appointment_reminders;
CREATE POLICY "Allow authenticated insert reminders" ON public.appointment_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update reminders" ON public.appointment_reminders;
CREATE POLICY "Allow authenticated update reminders" ON public.appointment_reminders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete reminders" ON public.appointment_reminders;
CREATE POLICY "Allow authenticated delete reminders" ON public.appointment_reminders
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service role full access reminders" ON public.appointment_reminders;
CREATE POLICY "Allow service role full access reminders" ON public.appointment_reminders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

