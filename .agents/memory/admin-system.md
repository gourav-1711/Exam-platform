---
name: Admin System Architecture
description: Overview of the full admin management system built for Manish Ki Pathshala.
---

# Admin Management System

## Redux Store (5 slices)
`artifacts/exam-platform/src/store/`
- `authSlice`, `adminSlice`, `uiSlice`, `draftSlice`, `notificationSlice`
- `hooks.ts` exports `useAppDispatch` / `useAppSelector`
- Provided via `ReduxProvider` in `providers.tsx`

## DB Schema
`lib/db/src/schema/admin.ts` — exams, examQuestions, questionDrafts, examDrafts, studentAttempts, activityLogs, adminNotifications

## API Routes (all under /api/admin, guarded by requireAdmin)
`artifacts/api-server/src/routes/admin/`
- `dashboard.ts`, `questions.ts`, `exams.ts`, `drafts.ts`, `students.ts`, `analytics.ts`, `activityLogs.ts`
- Security: helmet + express-rate-limit + `trust proxy: 1` in app.ts
- Caching: NodeCache singleton at `artifacts/api-server/src/lib/cache.ts`

## Admin Frontend Pages
`artifacts/exam-platform/src/app/(admin)/admin/`
- dashboard, questions/new, questions/[id]/edit, exams/new, exams/[id]/edit, students, analytics, drafts, activity-logs, settings
- Auto-draft save: 3s debounce via Redux draftSlice + /api/admin/drafts/

## Role Gating
- Server layout `(admin)/layout.tsx` checks `auth().sessionClaims?.publicMetadata?.role === "admin"`
- Middleware `src/middleware.ts` protects `/admin(.*)` with `auth.protect()`
- API: `requireAdmin` middleware in `adminMiddleware.ts`

## Admin Components
- `AdminSidebar` — collapsible sidebar with all nav links
- `DraftStatus` — reads Redux draftSlice, shows saving/saved/error
- `QuestionForm` — reusable form with auto-draft save
