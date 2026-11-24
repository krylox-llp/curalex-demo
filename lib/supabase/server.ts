import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_API_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase server client for server components, server actions and
 * route handlers. Reads the session from the current request's cookies.
 *
 * Writes go through the cookie store, which is allowed in route handlers but
 * throws in server components — `proxy.ts` is responsible for writing
 * refreshed cookies on every request, so this is best-effort here.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_API_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Cookies cannot be written in this context; proxy.ts handles
          // session refresh.
        }
      },
    },
  });
}
