# Refactor Plan — Exam-Platform Architecture (Workspace -> Hardened Server + Hand-Rolled Typed Client + RQ + Private DB)

## Information gathered (from repo inspection)

- `pnpm-workspace.yaml` already uses `packages: lib/*` and `src/*` globs, so deleting the old generated API workspaces is primarily a matter of removing workspace references and dependencies.
- `src/api-server/src/app.ts` already has the desired middleware order: `helmet` → `cors` → body parsing → `globalRateLimiter` → routes → 404 → `errorHandler`.
- `src/api-server/src/middleware/auth.middleware.ts` currently uses `jsonwebtoken` + `process.env.JWT_SECRET` and returns inline JSON errors; it does **not** follow the target Clerk token verification + centralized `AppError`/`errorHandler` pattern.
- The repo contains auth/admin middleware in two places:
  - `src/api-server/src/middleware/` (e.g. `auth.middleware.ts`, `auth.ts`, `errorHandler.ts`, etc.)
  - `src/api-server/src/middlewares/` (e.g. `adminMiddleware.ts`, `rateLimitMiddleware.ts`, `clerkProxyMiddleware.ts`)
    This must be reconciled carefully to avoid breaking imports.
- Tooling note: `search_files` failed because `ripgrep` binary is missing in the environment; I will avoid it and instead use `list_files` + targeted `read_file`.

## Plan

### Step 1 — Discover current usages without ripgrep

- Use `list_files` on:
  - `src/api-server/src/routes/`
  - `src/api-server/src/routes/admin/`
  - `src/exam-platform/src/`
- Use `read_file` on the specific files that likely import/delete targets:
  - the old generated API workspace package references

### Step 2 — Make DB private to api-server

- `lib/db/src/index.ts`: change to re-export schema only.
- Add new file: `src/api-server/src/db/index.ts`
  - create pg Pool
  - create drizzle instance importing schema from `@exam-platform/db`
- `src/api-server/src/lib/db.ts`: re-export from `../db/index`.

### Step 3 — Harden api-server

- Add `src/api-server/src/config/env.ts` using `zod`.
- Update `src/api-server/src/index.ts` to parse env at the top.
- Rewrite/align `src/api-server/src/middleware/auth.ts` to:
  - verify Clerk JWT via Clerk SDK
  - set `req.userId` / `req.sessionId`
  - use `AppError` and forward errors to `next(err)`.
- Consolidate admin middleware:
  - merge/update `adminMiddleware` from `src/api-server/src/middlewares/` into the target module under `src/api-server/src/middleware/`.
- Ensure `src/api-server/src/middleware/errorHandler.ts` matches the `AppError` contract expected by routes/middleware.

### Step 4 — Route consistency

- For every route under `src/api-server/src/routes/**`:
  - replace inline `res.status(500).json(...)` with `next(err)`.
  - remove inline auth/rate-limit logic and use shared middleware.
  - ensure every mutation endpoint uses strict rate limiting where applicable.
  - ensure every admin route is behind `requireAuth` + `requireAdmin`.

### Step 5 — Delete lib codegen workspaces

- Delete directories:
  - the old generated API workspace directories
- Update `pnpm-workspace.yaml` if it explicitly lists these packages.
- Remove dependencies on:
  - the old generated API workspace package references
    from `src/api-server/package.json` and `src/exam-platform/package.json`.

### Step 6 — Hand-rolled typed fetch client inside exam-platform

- Create:
  - `src/exam-platform/src/lib/api/client.ts`
  - `src/exam-platform/src/lib/api/endpoints.ts`
  - `src/exam-platform/src/lib/api/query-keys.ts`
- Add React Query:
  - `src/exam-platform/src/components/providers/QueryProvider.tsx`
  - (and query client singleton if missing)
- Update `src/exam-platform/src/app/providers.tsx` to include QueryProvider.

### Step 7 — RSC server fetching + client hydration

- Update public/static pages to:
  - fetch on server (Next fetch caching + `revalidate`)
  - pass `initialData` to client views that use React Query.

### Step 8 — Clean Redux

- Remove `authSlice` if it exists and replace with Clerk hooks.
- Keep UI-only slices (ui/notification/draft) and move any server state to React Query.

### Followup steps (after code changes)

- Run:
  - `pnpm install`
  - `pnpm --filter @exam-platform/api-server build`
  - `pnpm --filter @exam-platform/exam-platform build`
