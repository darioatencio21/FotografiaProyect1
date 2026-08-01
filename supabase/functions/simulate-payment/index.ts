import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.8"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const MAX_ATTEMPTS = 3
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  try {
    const { bookingId, token } = await req.json()

    if (!bookingId || !token) {
      return new Response(
        JSON.stringify({ error: "bookingId and token are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("apykeysecret_new")!
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration")
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, approvalToken, status, depositAmount")
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

    // Only bookable states may be paid; never reprocess an already-confirmed
    // (or otherwise final) booking.
    if (booking.status !== "pending" && booking.status !== "approved") {
      return new Response(
        JSON.stringify({ error: "Booking cannot be paid in its current state", status: booking.status }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Rate limit: max MAX_ATTEMPTS per booking per rolling hour. Counted after
    // token verification so a stranger cannot lock out a legitimate client.
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count, error: countError } = await supabase
      .from("payment_attempts")
      .select("booking_id", { count: "exact", head: true })
      .eq("booking_id", bookingId)
      .gte("created_at", since)

    if (countError) throw countError

    if ((count || 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: "Too many payment attempts. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    await supabase.from("payment_attempts").insert({ booking_id: bookingId })

    const txHash = `demo_${crypto.randomUUID()}`

    // Conditional update re-checks the status so two concurrent requests cannot
    // double-confirm: only the first one matches a row in the bookable state.
    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({
        isPaid: true,
        paymentStatus: "paid",
        status: "confirmed",
        paymentTxHash: txHash,
        paymentProvider: "demo-simulation",
      })
      .eq("id", bookingId)
      .eq("status", booking.status)
      .select("id")

    if (updateError) throw updateError

    if (!updated || updated.length === 0) {
      return new Response(
        JSON.stringify({ error: "Booking was already processed" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        txHash,
        depositAmount: booking.depositAmount ?? 0,
        provider: "demo-simulation",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("simulate-payment error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
