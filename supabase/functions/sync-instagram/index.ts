import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("apykeysecret_new") || ""
const CRON_SECRET = Deno.env.get("CRON_SECRET") || ""

interface InstagramMedia {
  id: string
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
}

async function getStoredToken(supabase: any): Promise<string | null> {
  const { data } = await supabase
    .from("instagram_config")
    .select("access_token")
    .eq("id", "instagram")
    .single()
  if (data?.access_token) return data.access_token
  return Deno.env.get("INSTAGRAM_ACCESS_TOKEN") || null
}

async function refreshToken(token: string): Promise<string | null> {
  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`Token refresh failed: ${res.status} ${await res.text()}`)
      return null
    }
    const data = await res.json()
    return data.access_token || null
  } catch (err) {
    console.error("Token refresh error:", err)
    return null
  }
}

async function saveToken(supabase: any, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString()
  await supabase.from("instagram_config").upsert({
    id: "instagram",
    access_token: token,
    token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" })
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const authHeader = req.headers.get("x-cron-secret") || ""
  if (CRON_SECRET && authHeader !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  let token = await getStoredToken(supabase)
  if (!token) {
    const { data: existing } = await supabase
      .from("instagram_posts")
      .select("id")
      .limit(1)
    return new Response(
      JSON.stringify({ status: "skipped_no_token", hasData: existing && existing.length > 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  const refreshed = await refreshToken(token)
  if (refreshed) {
    token = refreshed
    await saveToken(supabase, token)
  }

  try {
    const IG_USER_ID = Deno.env.get("INSTAGRAM_USER_ID") || "me"
    const url = `https://graph.instagram.com/${IG_USER_ID}/media?fields=id,media_url,permalink,caption,timestamp&access_token=${token}&limit=8`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Instagram API error: ${res.status}`)

    const data = await res.json()
    const posts: InstagramMedia[] = data.data || []

    await supabase.from("instagram_posts").delete().neq("id", "placeholder")

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      await supabase.from("instagram_posts").upsert({
        id: post.id,
        image_url: post.media_url,
        post_url: post.permalink,
        caption: post.caption || "",
        timestamp: post.timestamp,
        sort_order: i,
      }, { onConflict: "id" })
    }

    return new Response(
      JSON.stringify({ status: "ok", count: posts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("sync-instagram error:", err)
    return new Response(
      JSON.stringify({ status: "error", error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
