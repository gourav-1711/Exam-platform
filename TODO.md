# TODO — Exam-Platform Architecture Refactor

- [ ] Step 1: Enumerate repo usage via `list_files` + targeted `read_file` (no ripgrep)
- [ ] Step 2: Refactor `lib/db` to export schema-only
- [ ] Step 3: Add `src/api-server/src/db/index.ts` (drizzle + pg Pool)
- [ ] Step 4: Update `src/api-server/src/lib/db.ts` re-export
- [ ] Step 5: Add `src/api-server/src/config/env.ts` (zod) + wire into `src/api-server/src/index.ts`
- [ ] Step 6: Align Clerk auth middleware + centralized AppError/errorHandler pattern
- [ ] Step 7: Consolidate admin middleware into `src/api-server/src/middleware/adminAuth.ts`
- [ ] Step 8: Ensure all route handlers call `next(err)` and remove inline auth/rate limit
- [ ] Step 9: Add rate limiter modules required by hardened middleware chain (if not already present)
- [ ] Step 10: Delete the old generated API workspace directories
- [ ] Step 11: Update `pnpm-workspace.yaml` and package.json deps for deleted workspaces
- [x] Step 12: Create hand-rolled typed fetch client in `src/exam-platform/src/lib/api/*`
- [x] Step 13: Add React Query singleton + `QueryProvider` and wrap in `src/exam-platform/src/app/providers.tsx`

- [ ] Step 14: Update server-fetched pages to pass `initialData` to client views
- [ ] Step 15: Remove authSlice from Redux and migrate to Clerk hooks
- [ ] Step 16: Build + install validation
