import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const authHeader = req.headers.get("Authorization")
  const cronSecret = Deno.env.get("CRON_SECRET")
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !supabaseKey) {
    return new Response("Missing Supabase config", { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const today = new Date().toISOString().split("T")[0]

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", today)
    .eq("status", "accepted")
    .eq("reminderSent", false)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "No bookings to remind today" }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: emailConfig, error: configError } = await supabase
    .from("emailconfig")
    .select("*")
    .eq("id", "config")
    .single()

  if (configError || !emailConfig) {
    return new Response(JSON.stringify({ error: "Email config not found" }), { status: 500 })
  }

  const serviceId = emailConfig.emailjsServiceId
  const templateId = emailConfig.emailjsTemplateId
  const publicKey = emailConfig.emailjsPublicKey
  const privateKey = emailConfig.emailjsPrivateKey || ""

  if (!serviceId || !templateId || !publicKey) {
    return new Response(JSON.stringify({ error: "Incomplete EmailJS config" }), { status: 500 })
  }

  const results = { sent: 0, errors: 0, details: [] }

  for (const booking of bookings) {
    try {
      const body: Record<string, unknown> = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey || undefined,
        template_params: {
          to_name: booking.clientName,
          to_email: booking.clientEmail,
          from_name: "Miriam Campos",
          message: "Recordatorio: Tu sesi\u00f3n fotogr\u00e1fica es HOY a las " + booking.timeSlot + ".",
          booking_details: "Sesi\u00f3n: " + (booking.packageName || "Fotograf\u00eda") + " - Fecha: " + booking.date + " - Horario: " + booking.timeSlot,
        },
      }

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error("EmailJS error " + response.status + ": " + errBody)
      }

      await supabase
        .from("bookings")
        .update({ reminderSent: true, reminderSentAt: new Date().toISOString() })
        .eq("id", booking.id)

      results.sent++
    } catch (err) {
      results.errors++
      results.details.push({ id: booking.id, error: err.message || String(err) })
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  })
})
