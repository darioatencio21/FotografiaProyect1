import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.8"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const RATE_LIMIT_WINDOW_MS = 3_600_000 // 1 hour
const RATE_LIMIT_MAX = 5

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_TO_LENGTH = 254
const MAX_SUBJECT_LENGTH = 200
const MAX_BODY_LENGTH = 50_000

const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false
  if (value.length === 0 || value.length > MAX_TO_LENGTH) return false
  if (value !== value.trim()) return false
  if (/[\r\n]/.test(value)) return false
  return EMAIL_REGEX.test(value)
}

function isValidSubject(value: unknown): boolean {
  if (typeof value !== "string") return false
  if (value.length === 0 || value.length > MAX_SUBJECT_LENGTH) return false
  return !/[\r\n]/.test(value)
}

function getClientIp(req: Request): string {
  const forwarded = (req.headers.get("x-forwarded-for") || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (forwarded.length > 0) return forwarded[forwarded.length - 1]
  return req.headers.get("x-real-ip") || "unknown"
}

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
    if (!error && user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      isAdmin = true
    }
  }

  if (!isAdmin) {
    const ip = getClientIp(req)
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

  if (!isValidEmail(body.to)) {
    return new Response(JSON.stringify({ error: "Invalid 'to' email address" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!isValidSubject(body.subject)) {
    return new Response(JSON.stringify({ error: "Invalid 'subject'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (typeof body.html === "string" && body.html.length > MAX_BODY_LENGTH) {
    return new Response(JSON.stringify({ error: "'html' content too long" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (typeof body.text === "string" && body.text.length > MAX_BODY_LENGTH) {
    return new Response(JSON.stringify({ error: "'text' content too long" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!body.html && !body.text) {
    return new Response(JSON.stringify({ error: "Missing required fields: html or text" }), {
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
      console.error(`[send-email] Resend API failure — status: ${res.status}, body: ${errBody}`)
      throw new Error(`Resend error ${res.status}: ${errBody}`)
    }

    const data = await res.json()
    console.log(`[send-email] Resend success — id: ${data.id}`)
    return new Response(JSON.stringify({ sent: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[send-email] caught:", err?.message || err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
