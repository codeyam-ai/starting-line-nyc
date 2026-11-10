---
title: "Sign up and log in with free accounts"
mode: ui
createdAt: "2026-11-10T22:48:14Z"
source: manual
---

## Summary

"Log in" and "Sign up free" in the header, and the "Sign up free" button in the home page's "Save races to see your season" box, all jump to `/#season`. That box says accounts aren't live yet. On phones, "Sign up free" is the only button left in the header, so the most visible control on the site goes nowhere. This plan adds real, free accounts. A runner can sign up, log in and log out, and the header shows whether they are signed in. Moving saved races to the account comes next, in its own plan (*Saved races follow your account across devices*).

## Key decisions

- **Supabase Auth on its free tier.** The race database ships with the site as a read-only SQLite file (`dev.db`, see `next.config.ts` and `DEPLOY.md`), so the site has nowhere to store users itself. Supabase's free tier includes hosted auth and a Postgres database for the follow-up saved-races plan. Clerk and Auth0 are free too, but they don't include a database. NextAuth and better-auth would need a writable database the site doesn't have.
- **Email sign-in link (passwordless) first, Google sign-in optional.** A runner types their email, gets a link, and is signed in. A first-time email creates the account, so one `/login` page covers both "Log in" and "Sign up". With no passwords there is no reset flow to build. Google sign-in is a small add-on once the Supabase project exists. Include it if the Google OAuth client is set up during execution, and skip it otherwise.
- **Supabase's built-in email sender is rate-limited** (a handful of emails per hour on the free tier). That's enough for launch. Note in `DEPLOY.md` that heavier use needs a free SMTP provider (for example Resend) plugged into Supabase.
- **Keep the `app/lib/auth.ts` seam from `AUTH_PATTERNS.md` / `AUTH_UPGRADE.md`.** Consumers call `getSession()` / `signOut()` and never touch Supabase directly. The pattern's `signIn(email, password)` becomes `sendSignInLink(email)`, because sign-in is passwordless. **When the Supabase env vars are unset** (local dev, scenario captures), `auth.ts` falls back to a local stub session, so scenarios can show signed-in and signed-out headers without network access. That follows `AUTH_PATTERNS.md`'s rule against requiring external providers during prototyping.
- **Next.js 16 renamed `middleware.ts` to `proxy.ts`.** Supabase's session-refresh hook goes in a root `proxy.ts`. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` before writing it.
- **Steps only the site owner can do** (the build agent must stop and ask for these, never invent values): create the free Supabase project; add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel (Project → Settings → Environment Variables) and in `.env.local`; set the Supabase Site URL to `https://startinglinenyc.com`; add redirect URLs for `startinglinenyc.com`, `starting-line-nyc.vercel.app` and `localhost`.
- **This supersedes the queued stub plan** `save-log-in-sign-up-and-more-filters-do-not-work-yet-there-are-no-accounts-and-the-page-says-so.md` for its Log in / Sign up part.

## Implementation

### 1. Auth seam

**New file**: `app/lib/auth.ts`, the `AuthUser` / `Session` types plus `getSession()`, `requireAuth()`, `sendSignInLink(email, next)` and `signOut()`. It uses Supabase (`@supabase/ssr`) when the env vars are set and the local stub otherwise.

**New file**: `proxy.ts`, which refreshes the Supabase session cookie on each request. It does nothing when Supabase isn't configured.

**New file**: `app/auth/callback/route.ts`, which exchanges the emailed link's code for a session and redirects to the `next` path (only same-site paths starting with `/`).

**File**: `package.json`, add `@supabase/supabase-js` and `@supabase/ssr`.

### 2. Log in / sign up page

**New file**: `app/login/page.tsx`, built with `PageShell`, `SiteHeader` and `SiteFooter`. It has an email form ("Email me a sign-in link"), a "Check your email" confirmation state, an error state for invalid email and rate limits, and optionally "Continue with Google". It accepts `?next=` so the runner returns to the page they came from. The copy tells runners that saves on this device stay put.

### 3. Header knows who is signed in

**File**: `app/components/SiteHeader.tsx`. Signed out: "Log in" goes to `/login`, and "Sign up free" goes to `/login?mode=signup` (same page, sign-up wording). Signed in: replace both with an account menu showing the runner's email and a "Log out" button (a form posting to a new `app/auth/logout/route.ts`). Pages pass the session in (or the header reads `getSession()` itself, since it's already server-rendered). Keep the phone layout in `app/globals.css` (`.bar .right` rules around lines 253–316) working: My Races plus the account control.

### 4. Stop saying accounts aren't live

**File**: `app/components/SeasonTeaser.tsx`. The "Sign up free" button links to `/login?mode=signup` and drops `aria-disabled`. Signed-in runners see "Go to My Races" instead.

**File**: `app/components/MyRacesHeader.tsx`. Replace "Accounts aren't live yet." with wording that's true after this plan: saves are still on this device until the follow-up plan lands.

### 5. Hosting docs

**File**: `DEPLOY.md`. "No environment variables are required" is no longer true. Document the two Supabase variables, the redirect-URL setup and the email rate limit.

## Reused existing code

- `PageShell` from `app/components/PageShell.tsx` (glossary entry: `PageShell`)
- `SiteHeader` from `app/components/SiteHeader.tsx` (glossary entry: `SiteHeader`)
- `SiteFooter` from `app/components/SiteFooter.tsx` (glossary entry: `SiteFooter`)
- The `auth.ts` interface and upgrade path in `AUTH_PATTERNS.md` and `AUTH_UPGRADE.md` (Supabase section)

## Scenarios to demonstrate

- Header signed out, desktop and phone width
- Header signed in, with the account menu open
- `/login` empty, "Check your email" sent state, and invalid-email error
- Home page "Save races to see your season" box, signed out and signed in