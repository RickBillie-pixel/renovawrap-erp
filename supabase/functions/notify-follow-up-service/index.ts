import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const webhookUrl = Deno.env.get("WEBHOOK_FOLLOW_UP_SERVICE");
    if (!webhookUrl) {
      console.error("Missing WEBHOOK_FOLLOW_UP_SERVICE secret");
      return new Response(
        JSON.stringify({ error: "Configuration error: Missing webhook secret" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    console.log("Processing request body:", body);
    const { appointment_id } = body;
    
    let appointmentsToProcess = [];

    if (appointment_id) {
      // Manual mode: Fetch specific appointment
      console.log(`Manual trigger for appointment ${appointment_id}`);
      const { data: appointment, error } = await supabaseClient
        .from("appointments")
        .select("*")
        .eq("id", appointment_id)
        .single();
      
      if (error) {
        console.error("Error fetching appointment:", error);
        throw error;
      }
      if (appointment) appointmentsToProcess.push(appointment);
    } else {
      // Cron mode: Fetch reminders for today
      const today = new Date().toISOString().split("T")[0];
      const { data: reminders, error: reminderError } = await supabaseClient
        .from("service_review_reminders")
        .select("appointment_id, appointments(*)")
        .eq("reminder_date", today)
        .eq("status", "gepland");

      if (reminderError) throw reminderError;
      
      // Filter valid appointments from reminders
      if (reminders) {
        appointmentsToProcess = reminders
          .map((r: any) => r.appointments)
          .filter((a: any) => a && a.status === "voltooid" && !a.follow_up_sent);
      }
    }

    const results = [];

    for (const appointment of appointmentsToProcess) {
      if (!appointment.customer_email) {
        results.push({ id: appointment.id, status: "skipped", reason: "no email" });
        continue;
      }

      const payload = {
        type: "follow_up_service",
        customer_name: appointment.customer_name || "Klant",
        service_type: appointment.title,
        service_date: appointment.date,
        service_location: appointment.address,
        email: appointment.customer_email
      };

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`);
        }

        // Update appointment status
        await supabaseClient
          .from("appointments")
          .update({ follow_up_sent: true })
          .eq("id", appointment.id);

        // Update reminder status
        // We use update with match on appointment_id because we might process via manual trigger 
        // which doesn't give us the reminder ID directly, but appointment_id is unique enough here
        await supabaseClient
          .from("service_review_reminders")
          .update({ status: "verzonden", sent_at: new Date().toISOString() })
          .eq("appointment_id", appointment.id);

        results.push({ id: appointment.id, status: "sent" });
      } catch (err: any) {
        console.error(`Failed to process appointment ${appointment.id}:`, err);
        results.push({ id: appointment.id, status: "failed", error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error processing review reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
