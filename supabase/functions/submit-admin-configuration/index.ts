import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubmissionData {
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authentication if Authorization header is present
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      
      if (authError || !user) {
        console.warn("Invalid auth token, continuing as anonymous/service role");
        // We continue because we use service role key internally, but logging this might help
      }
    }

    // Parse request body
    const submissionData: SubmissionData = await req.json();

    // Validate required fields
    if (!submissionData.image_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: image_url" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert into admin_configurations table
    const { data: adminConfig, error: dbError } = await supabaseClient
      .from("admin_configurations")
      .insert({
        image_url: submissionData.image_url,
        service_details: submissionData.service_details || null,
        color_details: submissionData.color_details || null,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save configuration", details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Track usage for cost calculation (append-only, never deleted)
    await supabaseClient
      .from("configurator_usage_tracking")
      .insert({
        source: 'admin',
        configuration_id: adminConfig.id,
        cost_eur: 0.15
      });

    // Get admin webhook URL from secrets
    const webhookUrl = Deno.env.get("N8N_WEBHOOK_ADMIN_URL");
    if (!webhookUrl) {
      console.warn("N8N_WEBHOOK_ADMIN_URL not set, skipping webhook call");
      return new Response(
        JSON.stringify({
          success: true,
          submission_id: adminConfig.id,
          message: "Configuration saved but admin webhook not configured",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare webhook payload - telling n8n to update admin_configurations table
    const webhookPayload = {
      submission_id: adminConfig.id, // This is the ID n8n will use to update
      created_at: adminConfig.created_at,
      service_details: submissionData.service_details,
      color_details: submissionData.color_details,
      image_url: submissionData.image_url,
      is_admin_request: true,
      table: "admin_configurations" // Hint for n8n which table to update
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
      }
    } catch (webhookError) {
      console.error("Webhook request failed:", webhookError);
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        submission_id: adminConfig.id,
        message: "Admin configuration processed successfully",
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
