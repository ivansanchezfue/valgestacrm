import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function replaceVariables(text: string, context: Record<string, any>): string {
  if (!text) return text;
  return text
    .replace(/\{\{nombre\}\}/gi, context.name || "")
    .replace(/\{\{email\}\}/gi, context.email || "")
    .replace(/\{\{empresa\}\}/gi, context.name || "")
    .replace(/\{\{fecha\}\}/gi, new Date().toLocaleDateString("es-ES"))
    .replace(/\{\{telefono\}\}/gi, context.phone || "")
    .replace(/\{\{sector\}\}/gi, context.sector || "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { event, client, automationId } = await req.json();

    if (!event) {
      return new Response(JSON.stringify({ error: "event is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch matching active automations
    let query = supabase
      .from("automations")
      .select("*")
      .eq("is_active", true);

    if (automationId) {
      query = query.eq("id", automationId);
    } else {
      query = query.eq("trigger_type", event);
    }

    const { data: automations, error: autoError } = await query;

    if (autoError) {
      console.error("Error fetching automations:", autoError);
      return new Response(JSON.stringify({ error: "Failed to fetch automations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!automations || automations.length === 0) {
      return new Response(JSON.stringify({ message: "No matching automations found", executed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const context = client || {};
    const results: any[] = [];

    for (const automation of automations) {
      const actions = Array.isArray(automation.actions) ? automation.actions : [];
      const actionResults: any[] = [];

      for (const action of actions) {
        const type = action.type;
        const config = action.config || {};

        try {
          switch (type) {
            case "send_email": {
              // Resolve recipient
              let to = config.to;
              if (to === "client_email" && context.email) {
                to = context.email;
              } else if (to === "contact_email" && config.contact_email) {
                to = config.contact_email;
              } else if (to === "custom" && config.custom_email) {
                to = config.custom_email;
              }

              if (!to || !config.account_id) {
                actionResults.push({ type, status: "skipped", reason: "Missing to or account_id" });
                break;
              }

              const subject = replaceVariables(config.subject || "", context);
              const body = replaceVariables(config.body || "", context);

              // Call send-email function
              const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  accountId: config.account_id,
                  to,
                  subject,
                  body,
                  html: body.includes("<") ? body : undefined,
                }),
              });

              const sendResult = await sendRes.json();
              actionResults.push({ type, status: sendRes.ok ? "success" : "error", detail: sendResult });
              break;
            }

            case "send_bulk_email": {
              // Fetch clients based on filters
              let clientQuery = supabase.from("clients").select("id, name, email");

              if (config.filter_status && config.filter_status.length > 0) {
                clientQuery = clientQuery.in("status", config.filter_status);
              }
              if (config.filter_sector) {
                clientQuery = clientQuery.eq("sector", config.filter_sector);
              }

              const { data: clients } = await clientQuery;

              if (!clients || clients.length === 0 || !config.account_id) {
                actionResults.push({ type, status: "skipped", reason: "No recipients or no account" });
                break;
              }

              let sent = 0;
              let failed = 0;

              for (const c of clients) {
                if (!c.email) continue;
                const ctx = { ...context, name: c.name, email: c.email };
                const subject = replaceVariables(config.subject || "", ctx);
                const body = replaceVariables(config.body || "", ctx);

                try {
                  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${supabaseKey}`,
                    },
                    body: JSON.stringify({
                      accountId: config.account_id,
                      to: c.email,
                      subject,
                      body,
                      html: body.includes("<") ? body : undefined,
                    }),
                  });
                  if (res.ok) sent++;
                  else failed++;
                } catch {
                  failed++;
                }
              }

              actionResults.push({ type, status: "done", sent, failed });
              break;
            }

            case "create_task": {
              const title = replaceVariables(config.title || "Tarea automática", context);
              const description = replaceVariables(config.description || "", context);

              const { error: taskErr } = await supabase.from("tasks").insert({
                title,
                description,
                priority: config.priority || "media",
                assignee: config.assignee || "",
                client_id: context.id || null,
                status: "pendiente",
              });

              actionResults.push({ type, status: taskErr ? "error" : "success", error: taskErr?.message });
              break;
            }

            case "update_status": {
              if (!context.id || !config.new_status) {
                actionResults.push({ type, status: "skipped", reason: "Missing client id or new_status" });
                break;
              }

              const { error: statusErr } = await supabase
                .from("clients")
                .update({ status: config.new_status })
                .eq("id", context.id);

              actionResults.push({ type, status: statusErr ? "error" : "success" });
              break;
            }

            case "add_tag": {
              if (!context.id || !config.tag) {
                actionResults.push({ type, status: "skipped", reason: "Missing client id or tag" });
                break;
              }

              const { data: currentClient } = await supabase
                .from("clients")
                .select("tags")
                .eq("id", context.id)
                .single();

              const currentTags: string[] = currentClient?.tags || [];
              if (!currentTags.includes(config.tag)) {
                const { error: tagErr } = await supabase
                  .from("clients")
                  .update({ tags: [...currentTags, config.tag] })
                  .eq("id", context.id);
                actionResults.push({ type, status: tagErr ? "error" : "success" });
              } else {
                actionResults.push({ type, status: "skipped", reason: "Tag already exists" });
              }
              break;
            }

            case "wait": {
              // In a real system this would schedule a delayed job.
              // For now we log it.
              actionResults.push({ type, status: "noted", duration: config.duration, unit: config.unit });
              break;
            }

            default: {
              actionResults.push({ type, status: "unsupported" });
            }
          }
        } catch (actionErr: any) {
          actionResults.push({ type, status: "error", error: actionErr.message });
        }
      }

      results.push({ automationId: automation.id, name: automation.name, actions: actionResults });
    }

    return new Response(JSON.stringify({ executed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("run-automation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
