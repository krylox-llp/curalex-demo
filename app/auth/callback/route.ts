import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_API_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Where the user lands after the OAuth exchange succeeds.
const POST_LOGIN_PATH = "/register";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Not a PKCE callback — start from the app root.
  if (!code) {
    return NextResponse.redirect(new URL("/", requestUrl));
  }

  const response = NextResponse.redirect(new URL(POST_LOGIN_PATH, requestUrl));

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_API_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // The code is invalid or already consumed — back to the app root.
    return NextResponse.redirect(new URL("/", requestUrl));
  }

  return response;
}
