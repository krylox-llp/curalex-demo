import { connection } from "next/server";
import { createClient } from "./lib/supabase/server";

// Server-side auth module for CuraLex, backed by Supabase.
//
// The Google provider is configured on the Supabase project; the sign-in flow
// is Supabase's hosted OAuth: POST /api/sign-in-google (app/api/sign-in-google)
// starts the flow and returns the authorize URL — the browser then navigates
// to Google — and the auth code returns at app/auth/callback, which logs the
// user in and sends them to /register, the same destination the old NextAuth
// flow used.

export async function auth() {
  // Supabase compares Date.now() with the token's expiry, which is not allowed
  // while Next prerenders (cacheComponents / partialPrefetching render the App
  // Shell with the user's cookies). Wait for the real request first.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return null;
  return { user: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
