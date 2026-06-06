# Plan — Admin Panel Completion & Overhaul

This plan follows the provided task sections in order.

## Step A — Admin Header

- Create `src/exam-platform/src/components/admin/AdminHeader.tsx`
  - sticky top, breadcrumb (max 2 levels) using `usePathname()` + shadcn Breadcrumb
  - env badge from `NEXT_PUBLIC_APP_ENV` default `dev`
  - notifications bell w/ unread support tickets via `adminApi.supportTickets(token)` and popover
  - Clerk `<UserButton />` on the right
- Update `src/exam-platform/src/app/(admin)/admin/layout.tsx`
  - layout: sidebar + header + main (scroll)

## Step B — Fix public theme bleed

- Ensure root `src/exam-platform/src/app/layout.tsx` does not set global dark mode.
- Ensure admin only applies dark styling within admin wrapper.
- If needed, adjust `src/exam-platform/src/index.css` token scoping (move dark values under `.dark` if present).
- Remove any hard-coded dark-only classes that affect public routes.

## Step C — Remove Draft System

- Remove frontend draftSlice, routes, sidebar link.
- Delete server draft router and remove mount.

## Step D — Current Affairs data not showing

- Update server `src/api-server/src/routes/admin/currentAffairs.ts`
  - support `page/limit/search/filter` and return `{ items, total, page, limit }`
  - use `next(err)` error forwarding
- Update frontend pages/components to consume `data.items`.

## Step E onward

Follow the remaining sections (Dashboard, QuestionSelector, missing pages, Settings, Student/Exam detail sheets, sidebar, polish, query keys, final builds).

## Build + Animation Rules (applies throughout)

- Run builds **only once at the end of the implementation** (not after each section) to avoid time waste.
- Use **Framer Motion** (import from `framer-motion`) across the admin panel for entry/transition animations (e.g., header/content fade + slide, list row appear). Do not add light-mode toggles.
