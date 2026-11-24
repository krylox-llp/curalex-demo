// Server-side proxy for the Supabase `smart-api` edge function. Keys stay on
// the server, so the secret key is never sent to the browser.
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_API_KEY, SUPABASE_URL } from "@/lib/supabase/env";

const SMART_API_URL = `${SUPABASE_URL}/functions/v1/smart-api`;

/**
 * 1. Server key (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY), preferred:
 *    - new `sb_secret_` key: `apikey` only. Supabase rejects an sb_ key in
 *      both headers ("Conflicting API keys") and mints the JWT itself.
 *    - legacy service_role JWT: both headers.
 * 2. Otherwise the signed-in user's access token (a JWT) + the publishable
 *    key. A bare `sb_publishable_` key in Authorization is rejected
 *    ("Auth header is not 'Bearer {token}'").
 */
async function authHeaders(): Promise<Record<string, string> | null> {
  const serverKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (serverKey?.startsWith("sb_")) return { apikey: serverKey };
  if (serverKey)
    return { Authorization: `Bearer ${serverKey}`, apikey: serverKey };

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: SUPABASE_API_KEY,
  };
}

export async function POST(request: Request) {
  let inn = "";
  try {
    const body = await request.json();
    inn = typeof body?.inn === "string" ? body.inn.trim() : "";
  } catch {
    // invalid JSON body
  }
  if (!inn) {
    return Response.json({ error: "`inn` is required" }, { status: 400 });
  }

  const headers = await authHeaders();
  if (!headers) {
    return Response.json(
      { error: "Sign in to look up manufacturers" },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(SMART_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ inn }),
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      // not JSON — keep raw text
    }
    if (!res.ok) console.error("[smart-api]", inn, res.status, data);
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("[smart-api] request failed:", err);
    return Response.json({ error: "smart-api unreachable" }, { status: 502 });
  }
}
