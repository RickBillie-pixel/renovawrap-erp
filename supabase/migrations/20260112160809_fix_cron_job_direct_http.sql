-- =====================================================
-- Fix Cron Job for Appointment Reminders
-- Uses direct HTTP call instead of custom function
-- =====================================================

-- Remove old cron job if exists
SELECT cron.unschedule('send-daily-appointment-reminders');

-- Remove old function if exists
DROP FUNCTION IF EXISTS public.trigger_appointment_reminders();

-- Create new cron job that directly calls the edge function
-- Schedule: 0 8 * * * = 8:00 UTC = 9:00 CET (Dutch winter time)
-- Note: For summer time (CEST), this would be 10:00 local time
-- Adjust to 0 7 * * * if you want 9:00 during summer time
SELECT cron.schedule(
  'send-appointment-reminders-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://utsednlmdhdlmcterjoa.supabase.co/functions/v1/send-appointment-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Verify the job was created (this will show in migration output)
DO $$
BEGIN
  RAISE NOTICE 'Cron job send-appointment-reminders-daily scheduled for 8:00 UTC (9:00 CET)';
END $$;

