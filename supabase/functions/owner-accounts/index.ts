// Supabase Edge Function: deploy as owner-accounts with JWT verification enabled.
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are server-side secrets.
// NEVER put the service role key in the GitHub Pages website.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const origin = "https://usingaiinschoolf4fun.github.io";
const cors = {
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Vary": "Origin",
};
const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") return json(405, { error: "Method not allowed" });
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return json(401, { error: "Sign in required" });
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !serviceRole) return json(503, { error: "Server configuration incomplete" });
  const publicClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data: userData, error: authError } = await publicClient.auth.getUser(auth.slice(7));
  if (authError || !userData.user) return json(401, { error: "Invalid session" });
  if (userData.user.email?.toLowerCase() !== "jonathanspollard11@gmail.com") {
    return json(403, { error: "Owner access only" });
  }
  const admin = createClient(url, serviceRole, { auth: { persistSession: false } });
  try {
    const accounts: { username: string; email: string; created_at: string }[] = [];
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw error;
      for (const u of data.users) {
        accounts.push({
          username: String(u.user_metadata?.display_name || u.email?.split("@")[0] || "Movie Fan"),
          email: u.email || "",
          created_at: u.created_at,
        });
      }
      if (data.users.length < 100) break;
    }
    return json(200, { accounts });
  } catch {
    return json(500, { error: "Unable to retrieve accounts" });
  }
});
