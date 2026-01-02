import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubmissionData {
  name: string;
  email: string;
  address?: string;
  service_details: any;
  color_details: any;
  image_url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for database operations
    // We use the service role key to bypass RLS and ensure the insert succeeds
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const submissionData: SubmissionData = await req.json();

    // Validate required fields
    if (!submissionData.name || !submissionData.email || !submissionData.image_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, image_url" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert submission into database
    const { data: submission, error: dbError } = await supabaseClient
      .from("submissions")
      .insert({
        name: submissionData.name,
        email: submissionData.email,
        address: submissionData.address || null,
        service_details: submissionData.service_details || null,
        color_details: submissionData.color_details || null,
        image_url: submissionData.image_url,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission", details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get webhook URL from secrets
    const webhookUrl = Deno.env.get("WEBHOOK_URL");
    if (!webhookUrl) {
      console.warn("WEBHOOK_URL not set, skipping webhook call");
      return new Response(
        JSON.stringify({
          success: true,
          submission_id: submission.id,
          message: "Submission saved but webhook not configured",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare webhook payload
    const webhookPayload = {
      submission_id: submission.id,
      created_at: submission.created_at,
      name: submissionData.name,
      email: submissionData.email,
      address: submissionData.address,
      service_details: submissionData.service_details,
      color_details: submissionData.color_details,
      image_url: submissionData.image_url,
    };

    // Send to webhook
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        console.error("Webhook error:", await webhookResponse.text());
        // Don't fail the request if webhook fails, just log it
      }
    } catch (webhookError) {
      console.error("Webhook request failed:", webhookError);
      // Don't fail the request if webhook fails, just log it
    }

    // Send notification to admin
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const notifyUrl = `${supabaseUrl}/functions/v1/notify-admin`;
      
      const notificationPayload = {
        source: "configurator",
        lead_id: submission.id,
        name: submissionData.name,
        email: submissionData.email,
        created_at: submission.created_at,
        details: {
          address: submissionData.address,
          service_details: submissionData.service_details,
          color_details: submissionData.color_details,
          image_url: submissionData.image_url,
        },
      };

      const notifyResponse = await fetch(notifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""}`,
        },
        body: JSON.stringify(notificationPayload),
      });

      if (!notifyResponse.ok) {
        console.error("Notification error:", await notifyResponse.text());
        // Don't fail the request if notification fails, just log it
      }
    } catch (notifyError) {
      console.error("Notification request failed:", notifyError);
      // Don't fail the request if notification fails, just log it
    }

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: submission.id,
        message: "Submission saved successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

