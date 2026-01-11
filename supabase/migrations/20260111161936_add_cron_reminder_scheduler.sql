-- Enable pg_cron extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION public.trigger_appointment_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url TEXT;
  service_key TEXT;
BEGIN
  -- Get the Supabase project URL and service key from vault or use environment
  -- The edge function URL will be constructed
  project_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- If settings are not available, try to get from secrets
  IF project_url IS NULL THEN
    SELECT decrypted_secret INTO project_url 
    FROM vault.decrypted_secrets 
    WHERE name = 'supabase_url' 
    LIMIT 1;
  END IF;
  
  IF service_key IS NULL THEN
    SELECT decrypted_secret INTO service_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'service_role_key' 
    LIMIT 1;
  END IF;

  -- Make HTTP request to the edge function
  PERFORM net.http_post(
    url := project_url || '/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Schedule the cron job to run daily at 9:00 AM (Netherlands timezone)
-- Note: Supabase uses UTC, so 9:00 CET = 8:00 UTC (winter) or 7:00 UTC (summer)
-- Using 8:00 UTC as default (adjust as needed)
SELECT cron.schedule(
  'send-daily-appointment-reminders',
  '0 8 * * *', -- Every day at 8:00 UTC (9:00 CET)
  $$SELECT public.trigger_appointment_reminders()$$
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.trigger_appointment_reminders() TO service_role;

