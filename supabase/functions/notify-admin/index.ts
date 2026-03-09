import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const to = "info@renovawrap.nl";

    const sourceLabel = data.source === "configurator" ? "AI Configurator" : "Contact Formulier";
    const subject = `Nieuwe ${sourceLabel} Aanvraag - ${data.name || "Onbekend"}`;

    // Build simple HTML email
    let details = "";
    if (data.details) {
      const d = data.details;
      if (d.type) details += `<li><b>Type:</b> ${d.type}</li>`;
      if (d.service) details += `<li><b>Service:</b> ${d.service}</li>`;
      if (d.service_details?.label) details += `<li><b>Service:</b> ${d.service_details.label}</li>`;
      if (d.color) details += `<li><b>Kleur:</b> ${d.color}</li>`;
      if (d.color_details?.name) details += `<li><b>Kleur:</b> ${d.color_details.name}</li>`;
      if (d.message) details += `<li><b>Bericht:</b> ${d.message}</li>`;
      if (d.address) details += `<li><b>Adres:</b> ${d.address}</li>`;
      if (d.image_url) details += `<li><a href="${d.image_url}">Bekijk afbeelding</a></li>`;
      if (d.is_admin_request) details += `<li><b>Bron:</b> Admin Panel</li>`;
    }

    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
<div style="background:#1a1a1a;padding:24px;text-align:center;">
<h1 style="color:#b8860b;margin:0;font-size:22px;">RENOVAWRAP</h1>
<p style="color:#888;margin:4px 0 0;font-size:13px;">Nieuwe aanvraag</p>
</div>
<div style="padding:24px;background:#fff;border:1px solid #eee;">
<p style="color:#b8860b;font-weight:bold;font-size:15px;">${sourceLabel}</p>
<h3 style="margin:16px 0 8px;">Contactgegevens</h3>
<ul style="list-style:none;padding:0;">
<li><b>Naam:</b> ${data.name || "-"}</li>
<li><b>Email:</b> ${data.email || "-"}</li>
${data.phone ? `<li><b>Telefoon:</b> ${data.phone}</li>` : ""}
</ul>
${details ? `<h3 style="margin:16px 0 8px;">Details</h3><ul style="list-style:none;padding:0;">${details}</ul>` : ""}
</div>
<div style="padding:16px;text-align:center;color:#999;font-size:11px;">
Automatische notificatie - renovawrap.nl
</div></div>`;

    const plainText = `Nieuwe ${sourceLabel} aanvraag
Naam: ${data.name || "-"}
Email: ${data.email || "-"}
${data.phone ? `Telefoon: ${data.phone}` : ""}
Details: ${JSON.stringify(data.details, null, 2)}`;

    // Get SMTP settings
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFrom = Deno.env.get("SMTP_FROM") || smtpUser || "noreply@renovawrap.nl";

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("SMTP not configured. Email would be sent to:", to);
      console.log("Subject:", subject);
      console.log("Body:", plainText);
      return new Response(JSON.stringify({ success: true, message: "SMTP not configured, email logged" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via raw SMTP (built-in Deno, no external deps)
    let conn: any;
    try {
      if (smtpPort === 465) {
        conn = await Deno.connectTls({ hostname: smtpHost, port: smtpPort });
      } else {
        conn = await Deno.connect({ hostname: smtpHost, port: smtpPort });
      }

      const enc = new TextEncoder();
      const dec = new TextDecoder();

      const read = async (): Promise<string> => {
        const buf = new Uint8Array(4096);
        const n = await conn.read(buf);
        return n ? dec.decode(buf.subarray(0, n)) : "";
      };

      const send = async (cmd: string): Promise<string> => {
        await conn.write(enc.encode(cmd + "\r\n"));
        // Small delay to allow server to respond
        await new Promise(r => setTimeout(r, 200));
        return await read();
      };

      // SMTP conversation
      await read(); // greeting
      const ehlo = await send("EHLO renovawrap.nl");

      if (smtpPort === 587 && ehlo.includes("STARTTLS")) {
        await send("STARTTLS");
        conn = await Deno.startTls(conn, { hostname: smtpHost });
        await send("EHLO renovawrap.nl");
      }

      await send("AUTH LOGIN");
      await send(btoa(smtpUser));
      const authResp = await send(btoa(smtpPass));

      if (!authResp.includes("235")) {
        throw new Error("SMTP auth failed: " + authResp);
      }

      await send(`MAIL FROM:<${smtpFrom}>`);
      await send(`RCPT TO:<${to}>`);
      await send("DATA");

      const boundary = "b" + Date.now();
      const msg = [
        `From: RenovaWrap <${smtpFrom}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        plainText,
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html,
        ``,
        `--${boundary}--`,
        `.`,
      ].join("\r\n");

      await send(msg);
      await send("QUIT");
      try { conn.close(); } catch { /* ok */ }

      console.log("Email sent to", to);
    } catch (smtpErr: any) {
      console.error("SMTP error:", smtpErr.message);
      try { conn?.close(); } catch { /* ok */ }
      // Don't fail the response - just log it
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
