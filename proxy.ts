import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_API_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Proxy (the renamed `middleware.ts` on Next 15 and earlier) — refreshes the
 * Supabase Auth session on every request. When `getClaims()` finds the access
 * token close to expiring it refreshes the session; the new cookies are
 * written back to this response via `setAll` and are sent to the browser.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_API_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Verifies the JWT signature and refreshes near-expiry sessions; anonymous
  // requests have no session — that is not an error here.
  await supabase.auth.getClaims().catch(() => {});

  return response;
}
