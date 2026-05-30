---
name: Clerk Auth Setup
description: Clerk is provisioned (Replit-managed) and integrated into the exam platform.
---

Clerk is fully configured for this project.

**Setup state:** Managed by Replit (`setupClerkWhitelabelAuth` called). Secrets auto-provisioned: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`.

**Why:** User requested email/password + Google login, profile page, and protected routes.

**How to apply:**
- Server: `clerkProxyMiddleware` mounted before cors/body-parsers in `app.ts`; `clerkMiddleware` after body-parsers.
- Client: `ClerkProvider` wraps app in `App.tsx`; uses `publishableKeyFromHost` from `@clerk/react/internal`.
- CSS: `@layer theme, base, clerk, components, utilities;` before `@import 'tailwindcss'` in `index.css`.
- Vite: `tailwindcss({ optimize: false })` in `vite.config.ts` — required to prevent Clerk theme breakage in prod builds.
- Protected routes: `RequireAuth` wrapper using `<Show when="signed-in">` / `<Show when="signed-out"><Redirect to="/sign-in" />`.
- Protected pages: Daily Quizzes, Study Notes, Mock Tests, PYQ, NCERT MCQs.
- Sign-in/up routes: must be `/sign-in/*?` and `/sign-up/*?` (the `/*?` wildcard is required for Clerk OAuth sub-paths).
