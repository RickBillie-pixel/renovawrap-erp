-- =====================================================
-- Database Triggers for Email Notifications
-- Automatically sends email to info@renovawrap.nl
-- when new rows are inserted into lead tables
-- =====================================================

-- Ensure pg_net extension is enabled (for HTTP requests from SQL)
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =====================================================
-- Generic trigger function: calls notify-admin edge function
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  _payload JSONB;
  _source TEXT;
  _name TEXT;
  _email TEXT;
  _phone TEXT;
  _details JSONB;
  _supabase_url TEXT := 'https://utsednlmdhdlmcterjoa.supabase.co';
BEGIN
  -- Determine source and build payload based on table
  IF TG_TABLE_NAME = 'contact_requests' THEN
    _source := 'contact_form';
    _name := NEW.name;
    _email := NEW.email;
    _phone := NEW.phone;
    _details := jsonb_build_object(
      'type', NEW.type,
      'message', NEW.message,
      'photo_urls', NEW.photo_urls
    );

  ELSIF TG_TABLE_NAME = 'submissions' THEN
    _source := 'configurator';
    _name := NEW.name;
    _email := NEW.email;
    _details := jsonb_build_object(
      'address', NEW.address,
      'service_details', NEW.service_details,
      'color_details', NEW.color_details,
      'image_url', NEW.image_url
    );

  ELSIF TG_TABLE_NAME = 'admin_configurations' THEN
    _source := 'configurator';
    _name := 'Admin Configurator';
    _email := 'admin@renovawrap.nl';
    _details := jsonb_build_object(
      'service', COALESCE(NEW.service_details->>'label', NEW.service_details->>'value', 'Onbekend'),
      'color', COALESCE(NEW.color_details->>'name', 'Onbekend'),
      'color_code', COALESCE(NEW.color_details->>'code', ''),
      'image_url', NEW.image_url,
      'is_admin_request', true
    );

  ELSE
    -- Unknown table, skip
    RETURN NEW;
  END IF;

  -- Build the full notification payload
  _payload := jsonb_build_object(
    'source', _source,
    'lead_id', NEW.id::TEXT,
    'name', _name,
    'email', _email,
    'phone', COALESCE(_phone, ''),
    'created_at', NEW.created_at::TEXT,
    'details', _details
  );

  -- Call the notify-admin edge function via HTTP (deployed with --no-verify-jwt)
  PERFORM net.http_post(
    url := _supabase_url || '/functions/v1/notify-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := _payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Create triggers on each table
-- =====================================================

-- 1. Trigger on contact_requests (contact form submissions)
DROP TRIGGER IF EXISTS trg_notify_admin_contact_requests ON public.contact_requests;
CREATE TRIGGER trg_notify_admin_contact_requests
  AFTER INSERT ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_lead();

-- 2. Trigger on submissions (public configurator)
DROP TRIGGER IF EXISTS trg_notify_admin_submissions ON public.submissions;
CREATE TRIGGER trg_notify_admin_submissions
  AFTER INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_lead();

-- 3. Trigger on admin_configurations (admin configurator)
DROP TRIGGER IF EXISTS trg_notify_admin_admin_configurations ON public.admin_configurations;
CREATE TRIGGER trg_notify_admin_admin_configurations
  AFTER INSERT ON public.admin_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_lead();

-- Log that migration was applied
DO $$
BEGIN
  RAISE NOTICE 'Email notification triggers created on contact_requests, submissions, and admin_configurations';
END $$;
