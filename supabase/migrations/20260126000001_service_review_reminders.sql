
-- Create service_review_reminders table
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

CREATE TABLE IF NOT EXISTS public.service_review_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_time TIME NOT NULL DEFAULT '09:00:00',
  status TEXT NOT NULL DEFAULT 'gepland', -- 'gepland', 'verzonden', 'mislukt'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add follow_up_sent column to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT false;

-- Create function to automatically schedule reminder
CREATE OR REPLACE FUNCTION public.create_service_review_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger when status changes to 'voltooid'
  IF NEW.status = 'voltooid' AND (OLD.status IS NULL OR OLD.status != 'voltooid') THEN
    -- Check if reminder doesn't exist yet
    IF NOT EXISTS (SELECT 1 FROM public.service_review_reminders WHERE appointment_id = NEW.id) THEN
      INSERT INTO public.service_review_reminders (appointment_id, reminder_date, reminder_time, status)
      VALUES (
        NEW.id,
        CURRENT_DATE + INTERVAL '7 days',
        '09:00:00',
        'gepland'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to appointments table
DROP TRIGGER IF EXISTS create_service_review_reminder_trigger ON public.appointments;
CREATE TRIGGER create_service_review_reminder_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_service_review_reminder();

-- Schedule cron job to run daily at 08:00 UTC
-- Note: This requires pg_cron extension and appropriate permissions
-- The edge function URL and Authorization header need to be correct for the environment
SELECT cron.schedule(
  'daily-service-review-reminders',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ajzvywxgzmiwykvnrgsq.supabase.co/functions/v1/notify-follow-up-service',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
