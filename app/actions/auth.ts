"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";

/** Ends the Supabase session (clears the auth cookies) and returns to login. */
export async function logout() {
  try {
    await signOut();
  } catch (err) {
    // Email-only logins have no Supabase session; still send them to login.
    console.error("Sign-out failed:", err);
  }
  redirect("/");
}
