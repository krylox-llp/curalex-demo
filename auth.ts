import { createGoogleSSO } from "google-sso-library";

// Single NextAuth instance shared by the API route and server components
export const { handlers, auth, signIn, signOut } = createGoogleSSO({
  clientId: process.env.AUTH_GOOGLE_ID!,
  clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  secret: process.env.AUTH_SECRET!,
});
