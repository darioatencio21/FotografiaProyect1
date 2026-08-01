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
    const { passcode } = await req.json()

    if (!passcode || typeof passcode !== "string") {
      return new Response(
        JSON.stringify({ error: "Passcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("apykeysecret_new")!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const cleanCode = passcode.trim().toUpperCase()

    const { data: client, error } = await supabase
      .from("clientaccounts")
      .select("id, clientName, clientEmail, sessionDate, sessionTitle, photos")
      .ilike("passcode", cleanCode)
      .maybeSingle()

    if (error || !client) {
      return new Response(
        JSON.stringify({ error: "Invalid passcode" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const signedPhotos = await Promise.all(
      (client.photos || []).map(async (photo: any) => {
        const urlPath = extractStoragePath(photo.url)
        if (!urlPath) return { ...photo, signedUrl: photo.url }

        const { data } = await supabase.storage
          .from("proofs")
          .createSignedUrl(urlPath, 900)

        return {
          ...photo,
          signedUrl: data?.signedUrl || photo.url,
        }
      })
    )

    return new Response(
      JSON.stringify({
        client: {
          id: client.id,
          clientName: client.clientName,
          clientEmail: client.clientEmail,
          sessionDate: client.sessionDate,
          sessionTitle: client.sessionTitle,
        },
        photos: signedPhotos,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("validate-gallery error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

function extractStoragePath(url: string): string | null {
  if (!url) return null
  const pattern = /\/storage\/v1\/object\/public\/(?:proofs|photographs)\/(.+)/
  const match = url.match(pattern)
  if (match) return decodeURIComponent(match[1])

  const signedPattern = /\/storage\/v1\/object\/sign\/(?:proofs|photographs)\/([^?]+)/
  const signedMatch = url.match(signedPattern)
  if (signedMatch) return decodeURIComponent(signedMatch[1])

  try {
    const parsed = new URL(url)
    const pathParts = parsed.pathname.split("/")
    const buckets = ["proofs", "photographs"]
    const bucketIndex = pathParts.findIndex((p) => buckets.includes(p))
    if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
      return pathParts.slice(bucketIndex + 1).join("/")
    }
  } catch {
    return null
  }

  return null
}