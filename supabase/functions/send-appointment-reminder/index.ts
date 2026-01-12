import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_date: string;
  status: string;
  appointments: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    time: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    address: string | null;
  };
}

interface ReminderPayload {
  reminder_id: string;
  appointment: {
    id: string;
    title: string;
    date: string;
    time: string | null;
    description: string | null;
  };
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  address: string | null;
}

interface WebhookPayload {
  type: "appointment_reminder";
  reminders: ReminderPayload[];
  total_reminders: number;
  sent_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role for full database access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookUrl = Deno.env.get("WEBHOOK_APPOINTMENT_REMINDER");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
    }

    if (!webhookUrl) {
      console.warn("WEBHOOK_APPOINTMENT_REMINDER not configured, skipping send");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Webhook URL not configured, no reminders sent",
          sent: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use service role key for database operations (bypasses RLS)
    // Frontend already checks authentication via AuthGuard
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional reminder_id
    let requestBody: { reminder_id?: string } = {};
    try {
      const text = await req.text();
      if (text) {
        requestBody = JSON.parse(text);
      }
    } catch {
      // Empty body is fine for batch processing
    }

    const { reminder_id } = requestBody;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Build query based on whether we're sending a specific reminder or all for today
    let query = supabase
      .from("appointment_reminders")
      .select(`
        id,
        appointment_id,
        reminder_date,
        status,
        appointments (
          id,
          title,
          description,
          date,
          time,
          customer_name,
          customer_email,
          customer_phone,
          address
        )
      `)
      .eq("status", "gepland");

    if (reminder_id) {
      // Send specific reminder (for "Verstuur Nu" button)
      query = query.eq("id", reminder_id);
      console.log(`Processing specific reminder: ${reminder_id}`);
    } else {
      // Batch send all reminders for today (for cron job)
      query = query.eq("reminder_date", today);
      console.log(`Processing all reminders for today: ${today}`);
    }

    const { data: reminders, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch reminders: ${fetchError.message}`);
    }

    if (!reminders || reminders.length === 0) {
      const message = reminder_id 
        ? `Reminder ${reminder_id} not found or already sent`
        : "No pending reminders for today";
      console.log(message);
      return new Response(
        JSON.stringify({
          success: true,
          message,
          sent: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${reminders.length} pending reminder(s)`);

    // Filter reminders with valid email addresses
    const validReminders = (reminders as AppointmentReminder[]).filter(
      (r) => r.appointments && r.appointments.customer_email
    );

    if (validReminders.length === 0) {
      console.log("No reminders with valid email addresses");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No reminders with valid email addresses",
          sent: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare webhook payload with all reminders
    const reminderPayloads: ReminderPayload[] = validReminders.map((reminder) => ({
      reminder_id: reminder.id,
      appointment: {
        id: reminder.appointments.id,
        title: reminder.appointments.title,
        date: reminder.appointments.date,
        time: reminder.appointments.time,
        description: reminder.appointments.description,
      },
      customer: {
        name: reminder.appointments.customer_name,
        email: reminder.appointments.customer_email,
        phone: reminder.appointments.customer_phone,
      },
      address: reminder.appointments.address,
    }));

    const webhookPayload: WebhookPayload = {
      type: "appointment_reminder",
      reminders: reminderPayloads,
      total_reminders: reminderPayloads.length,
      sent_at: new Date().toISOString(),
    };

    console.log(`Sending ${reminderPayloads.length} reminder(s) to webhook`);

    // Send to webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      throw new Error(`Webhook returned ${webhookResponse.status}: ${errorText}`);
    }

    // Update all sent reminders status to 'verzonden'
    const reminderIds = validReminders.map((r) => r.id);
    const { error: updateError } = await supabase
      .from("appointment_reminders")
      .update({
        status: "verzonden",
        sent_at: new Date().toISOString(),
      })
      .in("id", reminderIds);

    if (updateError) {
      console.error("Failed to update reminder statuses:", updateError);
      // Still return success since webhook was sent
    }

    console.log(`Successfully sent ${validReminders.length} reminder(s)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${validReminders.length} reminder(s)`,
        sent: validReminders.length,
        reminder_ids: reminderIds,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminder:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
