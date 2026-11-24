# pharma_demo — CuraLex regulatory registration portal

App Router + TypeScript (strict) Next.js 16 app; single npm package. Product registration flow for NAFDAC (Nigeria): login → `/register` → product form + summary → email to the Trade Owner → `/upload-documents`.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build; this is the type-check (no separate typecheck script)
- `npm run lint` — eslint
- No tests exist

## Structure

- `app/page.tsx` — the login screen (`LoginForm` in `AuthLayout`); the home page is the login flow
- `auth.ts` — server-side `auth()` / `signOut()`, backed by Supabase. Google sign-in is Supabase's hosted OAuth: `GoogleButton` → POST `app/api/sign-in-google` → Google → `app/auth/callback` (PKCE code exchange, sets cookies) → `/register`
- `app/actions/auth.ts` — `logout` server action (used by `LogoutButton`); redirects to `/` even when sign-out fails, since email-only logins have no Supabase session
- `lib/supabase/env.ts` (credential resolution) and `lib/supabase/server.ts` (cookie-backed server client) — use these instead of reading Supabase env vars directly
- `proxy.ts` — Next 16's renamed `middleware.ts`; refreshes the Supabase session on every request
- `app/api/smart-api/route.ts` — server-side proxy to the Supabase `smart-api` edge function (manufacturer lookup by INN); keeps keys off the browser
- `app/api/send-email/route.ts` — Resend email to the Trade Owner linking to `/upload-documents?email=…&country=…` (`nodemailer` is in package.json but unused)
- `app/api/upload-documents/route.ts` — saves files to `<cwd>/uploads/<email>/<timestamp>/` on local disk; form fields `doc-1..N` follow `REGULATORY_DOCS` order
- `app/data/regulatoryDocs.ts` — required document list; `app/data/ceilingList.ts` — NAFDAC ceiling list (restricted imported APIs) transcribed from `Updated-NAFDAC-Ceiling-List-2026.pdf`, matched in `ProductForm`
- `app/components/*` — shared UI, each with a sibling `*.module.scss`; styles pull design tokens via `@use "../styles/variables" as *` (`app/styles/_variables.scss`)

## Environment

No `.env` files are checked in; set these locally or on the host:

- Supabase URL: `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- Supabase key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_KEY` / `SUPABASE_API_KEY`
- Optional server key for `smart-api`: `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` (an `sb_secret_` key goes in `apikey` only; a legacy JWT goes in both headers). Without it the signed-in user's token is used
- `RESEND_API_KEY` — email sending; `APP_URL` — base URL for the upload link (falls back to the request origin)
- The Google provider is configured on the Supabase project, not in this repo

## Gotchas

- `next.config.ts` enables `cacheComponents` and `partialPrefetching`: anything reading cookies or the current time (Supabase token expiry) must `await connection()` first, as `auth()` does, or prerendering fails
- `uploads/` is written at runtime and is not in `.gitignore`; keep it out of commits. Local-disk storage only works on a long-running Node server, not serverless hosting
- The two `<!-- BEGIN:nextjs-… -->` blocks below are written by `next dev` and come back if removed; commit AGENTS.md with your work so the tree stays clean

<!-- BEGIN:nextjs-agent-rules -->` block in AGENTS.md is auto-managed by `next dev` (see `node_modules/next/dist/server/lib/generate-agent-files.js`); it comes back if removed — commit AGENTS.md with the rest of the tree so it stays clean
- Supabase auth env vars — no `.env` files are checked in; set them locally or on the host: `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_URL` (project URL), `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`SUPABASE_KEY` (API key). The Google provider is configured on the Supabase project itself

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
