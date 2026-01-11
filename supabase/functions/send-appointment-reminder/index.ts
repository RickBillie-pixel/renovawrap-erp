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
    description: string;
    date: string;
    time: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    address: string | null;
  };
}

interface WebhookPayload {
  reminder_id: string;
  appointment: {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookUrl = Deno.env.get("WEBHOOK_APPOINTMENT_REMINDER");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Fetch all pending reminders for today with appointment data
    const { data: reminders, error: fetchError } = await supabase
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
      .eq("reminder_date", today)
      .eq("status", "gepland");

    if (fetchError) {
      throw new Error(`Failed to fetch reminders: ${fetchError.message}`);
    }

    if (!reminders || reminders.length === 0) {
      console.log("No pending reminders for today");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending reminders for today",
          sent: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${reminders.length} pending reminders for today`);

    const results: { id: string; success: boolean; error?: string }[] = [];

    // Process each reminder
    for (const reminder of reminders as AppointmentReminder[]) {
      try {
        // Skip if no appointment data
        if (!reminder.appointments) {
          console.warn(`Reminder ${reminder.id} has no appointment data, skipping`);
          continue;
        }

        // Prepare webhook payload
        const payload: WebhookPayload = {
          reminder_id: reminder.id,
          appointment: {
            id: reminder.appointments.id,
            title: reminder.appointments.title,
            description: reminder.appointments.description,
            date: reminder.appointments.date,
            time: reminder.appointments.time,
            customer_name: reminder.appointments.customer_name,
            customer_email: reminder.appointments.customer_email,
            customer_phone: reminder.appointments.customer_phone,
            address: reminder.appointments.address,
          },
        };

        // Send to webhook
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!webhookResponse.ok) {
          throw new Error(`Webhook returned ${webhookResponse.status}`);
        }

        // Update reminder status to 'verzonden'
        const { error: updateError } = await supabase
          .from("appointment_reminders")
          .update({
            status: "verzonden",
            sent_at: new Date().toISOString(),
          })
          .eq("id", reminder.id);

        if (updateError) {
          console.error(`Failed to update reminder ${reminder.id}:`, updateError);
          results.push({ id: reminder.id, success: false, error: updateError.message });
        } else {
          console.log(`Successfully sent reminder ${reminder.id}`);
          results.push({ id: reminder.id, success: true });
        }
      } catch (err: any) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
        results.push({ id: reminder.id, success: false, error: err.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${reminders.length} reminders: ${successCount} sent, ${failCount} failed`,
        sent: successCount,
        failed: failCount,
        details: results,
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

