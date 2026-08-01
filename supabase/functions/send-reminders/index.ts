import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev"

serve(async (req) => {
  const authHeader = req.headers.get("Authorization")
  const cronSecret = Deno.env.get("CRON_SECRET")
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!RESEND_API_KEY) {
    return new Response("RESEND_API_KEY not configured", { status: 500 })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseKey = Deno.env.get("apykeysecret_new")
  if (!supabaseUrl || !supabaseKey) {
    return new Response("Missing Supabase config", { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const today = new Date().toISOString().split("T")[0]

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", today)
    .in("status", ["confirmed", "approved"])
    .eq("reminderSent", false)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "No bookings to remind today" }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const results = { sent: 0, errors: 0, details: [] }

  for (const booking of bookings) {
    try {
      const text = `Hola ${booking.clientName},\n\nTe recordamos que tu sesión fotográfica es HOY a las ${booking.timeSlot}.\n\nPaquete: ${booking.packageName || 'Fotografía'}\n\nSaludos,\nMiriam Campos`
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: booking.clientEmail,
          subject: "Recordatorio: Tu sesión fotográfica es HOY",
          html: text.replace(/\n/g, "<br>"),
          text,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error("Resend error " + res.status + ": " + errBody)
      }

      await supabase
        .from("bookings")
        .update({ reminderSent: true, reminderSentAt: new Date().toISOString() })
        .eq("id", booking.id)

      results.sent++
    } catch (err) {
      results.errors++
      console.error("send-reminders error for booking", booking.id, ":", err)
      results.details.push({ id: booking.id, error: "Internal error" })
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  })
})
