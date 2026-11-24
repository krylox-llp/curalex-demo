import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_API_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Starts Supabase's hosted Google OAuth flow. The browser calls this from the
// Google button, gets the authorize URL back, then navigates to Google.
// Cookies Supabase wants to set during the start of the flow (the PKCE code
// verifier, for example) are put on the response for the browser.
export async function POST(request: NextRequest) {
  const redirectTo = new URL("/auth/callback", request.url).toString();

  const written: Array<{ name: string; value: string; options: CookieOptions }> = [];
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_API_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        written.push(...cookiesToSet);
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data) {
    return NextResponse.json(
      { url: null, error: error?.message ?? "sign_in_failed" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ url: data.url });
  for (const cookie of written) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
