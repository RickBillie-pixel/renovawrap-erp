import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadNotification {
  source: "configurator" | "contact_form";
  lead_id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  details?: any;
}

// Send email via SMTP using denomailer
async function sendEmailViaSMTP(
  to: string,
  subject: string,
  body: string,
  smtpHost: string,
  smtpPort: number,
  smtpUser: string,
  smtpPass: string,
  fromEmail: string,
  fromName: string = "RenovaWrap Admin"
): Promise<void> {
  const client = new SmtpClient();

  await client.connect({
    hostname: smtpHost,
    port: smtpPort,
    username: smtpUser,
    password: smtpPass,
  });

  await client.send({
    from: `${fromName} <${fromEmail}>`,
    to: [to],
    subject: subject,
    content: body,
    html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</pre>`,
  });

  await client.close();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const notificationData: LeadNotification = await req.json();

    // Get notification email from secrets
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");
    if (!notificationEmail) {
      console.warn("NOTIFICATION_EMAIL not set, skipping email notification");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Notification skipped - email not configured",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare email content
    const sourceLabel = notificationData.source === "configurator" 
      ? "Configurator" 
      : "Contact Formulier";
    
    const emailSubject = `Nieuwe Lead: ${notificationData.name} - ${sourceLabel}`;
    
    const emailBody = `Nieuwe lead ontvangen!

Bron: ${sourceLabel}
Lead ID: ${notificationData.lead_id}
Datum: ${new Date(notificationData.created_at).toLocaleString("nl-NL")}

Contactgegevens:
- Naam: ${notificationData.name}
- Email: ${notificationData.email}
${notificationData.phone ? `- Telefoon: ${notificationData.phone}` : ""}

Details:
${JSON.stringify(notificationData.details, null, 2)}

---
Dit is een automatische notificatie van het RenovaWrap admin systeem.`;

    // Get SMTP configuration from environment variables
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFrom = Deno.env.get("SMTP_FROM") || smtpUser || "noreply@renovawrap.nl";

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials not set, logging email instead");
      console.log("Email notification:");
      console.log("To:", notificationEmail);
      console.log("Subject:", emailSubject);
      console.log("Body:", emailBody);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email logged (SMTP not configured)",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send email via SMTP
    try {
      await sendEmailViaSMTP(
        notificationEmail,
        emailSubject,
        emailBody,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpFrom
      );

      console.log("Email sent successfully via SMTP");
    } catch (smtpError: any) {
      console.error("SMTP error:", smtpError);
      // Fallback: log the email
      console.log("Email notification (SMTP failed):");
      console.log("To:", notificationEmail);
      console.log("Subject:", emailSubject);
      console.log("Body:", emailBody);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send notification",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

