import { serve } from "https://deno.land/std@0.192.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const apiSecret = Deno.env.get("SEND_EMAIL_SECRET")
  const authHeader = req.headers.get("x-api-key")

  if (apiSecret && authHeader !== apiSecret) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Miriam Campos <onboarding@resend.dev>"

  let body: { to: string; subject: string; html?: string; text?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!body.to || !body.subject || (!body.html && !body.text)) {
    return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html or text" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const htmlContent = body.html
      ? `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${body.html}</body></html>`
      : (body.text || "").replace(/\n/g, "<br>");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [body.to],
        subject: body.subject,
        html: htmlContent,
        text: body.text || "",
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Resend error ${res.status}: ${errBody}`)
    }

    const data = await res.json()
    return new Response(JSON.stringify({ sent: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
