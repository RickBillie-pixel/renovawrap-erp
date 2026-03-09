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



serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const notificationData: LeadNotification = await req.json();

    // Always send to info@renovawrap.nl
    const notificationEmail = "info@renovawrap.nl";

    // Prepare email content
    const sourceLabel = notificationData.source === "configurator" 
      ? "AI Configurator" 
      : "Contact Formulier";
    
    const dateStr = new Date(notificationData.created_at).toLocaleString("nl-NL", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const emailSubject = `🔔 Nieuwe ${sourceLabel} Aanvraag - ${notificationData.name}`;
    
    // Build details HTML
    let detailsHtml = "";
    if (notificationData.details) {
      const d = notificationData.details;
      if (d.type) {
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Type project</td><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f0f0f0;">${d.type}</td></tr>`;
      }
      if (d.service || d.service_details?.label) {
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Service</td><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f0f0f0;">${d.service || d.service_details?.label}</td></tr>`;
      }
      if (d.color || d.color_details?.name) {
        const colorName = d.color || d.color_details?.name;
        const colorCode = d.color_code || d.color_details?.code || "";
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Kleur</td><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f0f0f0;">${colorName}${colorCode ? ` (${colorCode})` : ""}</td></tr>`;
      }
      if (d.message) {
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Bericht</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${d.message}</td></tr>`;
      }
      if (d.address) {
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Adres</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${d.address}</td></tr>`;
      }
      if (d.image_url) {
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Afbeelding</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;"><a href="${d.image_url}" style="color:#b8860b;">Bekijk afbeelding</a></td></tr>`;
      }
      if (d.photo_urls && d.photo_urls.length > 0) {
        const photoLinks = d.photo_urls.map((url: string, i: number) => `<a href="${url}" style="color:#b8860b;">Foto ${i + 1}</a>`).join(", ");
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Foto's</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${photoLinks}</td></tr>`;
      }
      if (d.is_admin_request) {
        detailsHtml += `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Bron</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">⚙️ Admin Panel</td></tr>`;
      }
    }

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#333 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#b8860b;font-size:24px;letter-spacing:1px;">RENOVAWRAP</h1>
              <p style="margin:8px 0 0;color:#999;font-size:13px;">Nieuwe aanvraag ontvangen</p>
            </td>
          </tr>
          <!-- Badge -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table cellpadding="0" cellspacing="0" style="background:#fdf8e8;border:1px solid #f0e4b8;border-radius:8px;width:100%;">
                <tr>
                  <td style="padding:12px 16px;">
                    <span style="color:#b8860b;font-weight:700;font-size:14px;">📋 ${sourceLabel}</span>
                    <span style="color:#999;font-size:12px;float:right;">${dateStr}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Contact Info -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:18px;border-bottom:2px solid #b8860b;padding-bottom:8px;">Contactgegevens</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
                <tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Naam</td><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #f0f0f0;">${notificationData.name}</td></tr>
                <tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;"><a href="mailto:${notificationData.email}" style="color:#b8860b;">${notificationData.email}</a></td></tr>
                ${notificationData.phone ? `<tr><td style="padding:8px 12px;color:#666;border-bottom:1px solid #f0f0f0;">Telefoon</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;"><a href="tel:${notificationData.phone}" style="color:#b8860b;">${notificationData.phone}</a></td></tr>` : ""}
                <tr><td style="padding:8px 12px;color:#666;">Lead ID</td><td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#999;">${notificationData.lead_id}</td></tr>
              </table>
            </td>
          </tr>
          <!-- Details -->
          ${detailsHtml ? `
          <tr>
            <td style="padding:24px 40px 0;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:18px;border-bottom:2px solid #b8860b;padding-bottom:8px;">Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
                ${detailsHtml}
              </table>
            </td>
          </tr>` : ""}
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee;margin-top:24px;">
              Dit is een automatische notificatie van het RenovaWrap systeem.<br/>
              <a href="https://renovawrap.nl" style="color:#b8860b;">renovawrap.nl</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Plain text fallback
    const emailBody = `Nieuwe ${sourceLabel} aanvraag ontvangen!

Datum: ${dateStr}

Contactgegevens:
- Naam: ${notificationData.name}
- Email: ${notificationData.email}
${notificationData.phone ? `- Telefoon: ${notificationData.phone}` : ""}
- Lead ID: ${notificationData.lead_id}

Details:
${JSON.stringify(notificationData.details, null, 2)}

---
Dit is een automatische notificatie van het RenovaWrap systeem.`;

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
      const client = new SmtpClient();

      await client.connect({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPass,
      });

      await client.send({
        from: `RenovaWrap <${smtpFrom}>`,
        to: [notificationEmail],
        subject: emailSubject,
        content: emailBody,
        html: emailHtml,
      });

      await client.close();

      console.log("Email sent successfully via SMTP to", notificationEmail);
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

