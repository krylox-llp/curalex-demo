// Supabase credentials for CuraLex. No .env files are checked in — set these
// in your environment or on the host:
//
//   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL                  project URL
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY /
//   NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_KEY /
//   SUPABASE_API_KEY                                        API key
//
// The Google provider itself is configured on the Supabase project; the
// sign-in flow uses Supabase's hosted OAuth (see GoogleButton.tsx and
// app/auth/callback/route.ts).

export const SUPABASE_URL: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

export const SUPABASE_API_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_API_KEY ||
  "";
