import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.8"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const RATE_LIMIT_WINDOW_MS = 3_600_000 // 1 hour
const RATE_LIMIT_MAX = 5

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!
  const supabaseServiceKey = Deno.env.get("apykeysecret_new")!
  const authHeader = req.headers.get("Authorization") || ""

  let isAdmin = false
  if (authHeader.startsWith("Bearer ")) {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    )
    if (!error && user) isAdmin = true
  }

  if (!isAdmin) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

    const { count, error: countError } = await serviceClient
      .from("email_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", since)

    if (!countError && count !== null && count >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    await serviceClient.from("email_rate_limits").insert({
      ip_address: ip,
      created_at: new Date().toISOString(),
    })
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
    console.error("send-email error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
