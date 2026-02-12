import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { accountId, to, subject, body, html } = await req.json();

    if (!accountId || !to || !subject) {
      return new Response(JSON.stringify({ error: "accountId, to, and subject are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: account, error: accError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (accError || !account) {
      return new Response(JSON.stringify({ error: "Email account not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SSL/TLS configuration based on ssl_mode
    // ssl = direct TLS connection (ports 465, 993, 995)
    // starttls = upgrade plain to TLS (port 587)
    // none = no encryption
    const sslMode = account.ssl_mode || "ssl";
    const tls = sslMode === "ssl";

    const connectionConfig: any = {
      hostname: account.smtp_host,
      port: account.smtp_port || 587,
      tls,
      auth: {
        username: account.username || account.email,
        password: account.password_encrypted || "",
      },
    };

    // For STARTTLS: connect without TLS, then upgrade
    if (sslMode === "starttls") {
      connectionConfig.tls = false;
    }

    const client = new SMTPClient({ connection: connectionConfig });

    await client.send({
      from: account.display_name
        ? `${account.display_name} <${account.email}>`
        : account.email,
      to,
      subject,
      content: body || "",
      html: html || undefined,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Send email error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
