import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.8"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  try {
    const { bookingId, token, updates, sendConfirmation } = await req.json()

    if (!bookingId || !token || !updates || typeof updates !== "object") {
      return new Response(
        JSON.stringify({ error: "bookingId, token, and updates object are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("apykeysecret_new")!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, approvalToken, status, clientName, clientEmail, date, timeSlot, packageName, depositAmount, amount")
      .eq("id", bookingId)
      .single()

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (booking.approvalToken !== token) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const allowedFields = new Set([
      "contractSignature", "contractSignedAt", "contractStatus",
      "paymentStatus", "isPaid", "paymentTxHash", "status",
    ])

    const sanitizedUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.has(key)) {
        sanitizedUpdates[key] = value
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid fields to update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update(sanitizedUpdates)
      .eq("id", bookingId)

    if (updateError) {
      throw updateError
    }

    if (sendConfirmation) {
      const resendKey = Deno.env.get("RESEND_API_KEY")
      const fromEmail = Deno.env.get("FROM_EMAIL") || "Miriam Campos <onboarding@resend.dev>"
      const photographerEmail = Deno.env.get("PHOTOGRAPHER_EMAIL") || ""

      if (resendKey) {
        const packageName = booking.packageName || "Photography Session"
        const depositPaid = Number(booking.depositAmount) || 0

        const clientSubject = "Booking Confirmed — Miriam Campos Photography"
        const clientText = `Hi ${booking.clientName},

Your booking for ${packageName} on ${booking.date} at ${booking.timeSlot} has been confirmed.

You paid $${depositPaid}. We look forward to seeing you!

Best regards,
Miriam Campos
Miriam Campos Photography`

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [booking.clientEmail],
              subject: clientSubject,
              text: clientText,
            }),
          })
        } catch {
          /* email is best-effort */
        }

        if (photographerEmail) {
          const photographerSubject = "New confirmed booking"
          const photographerText = `New confirmed booking

Client: ${booking.clientName}
Package: ${packageName}
Date: ${booking.date}
Time: ${booking.timeSlot}
Paid: $${depositPaid}

The booking is confirmed.`

          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendKey}`,
                "Content-Type": "application/json; charset=utf-8",
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [photographerEmail],
                subject: photographerSubject,
                text: photographerText,
              }),
            })
          } catch {
            /* best-effort */
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated: Object.keys(sanitizedUpdates) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("update-booking-status error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
