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
    const { token } = await req.json()

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Approval token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("apykeysecret_new")!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("approvalToken", token)
      .maybeSingle()

    if (error || !booking) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired approval link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const isExpired = booking.approvalExpiresAt && new Date(booking.approvalExpiresAt) < new Date()

    return new Response(
      JSON.stringify({
        booking: {
          ...booking,
          isExpired: !!isExpired,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("verify-approval error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})