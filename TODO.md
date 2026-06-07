# TODO — Admin Panel Overhaul and Fixes

## Milestone 1 — Core Core Corrections

- [x] Create global Confirmation Dialog & fix logo stretching in header/sidebar.
- [x] Add missing Syllabus, NCERT Books, and PYP Papers links to Admin Sidebar.
- [x] Relax `min="0"` constraints on negative markings to allow negative numeric entry.
- [x] Integrate global delete confirmation Dialog into Any Admin panel page that or will have delete functionality (all admin pages now use ConfirmDeleteDialog).

## Milestone 2 — Dynamic File / URL Upload & Dynamic Subjects

- [x] Support File Upload OR URL input for NCERT, Syllabus, and Study Notes.
- [x] Consolidate `pyq_subjects` into central `subjects` table schema.
- [x] Update API backend routes: Rename `/api/admin/pyq-subjects` to `/api/admin/subjects`.
- [x] Update Admin Sidebar and pages to point to `/admin/subjects` and resolve subject creation bugs.
- [x] Fetch Subjects dynamically on all admin pages (Exams, Questions, NCERT, PYP, Study Notes) and populate form drop-downs and list filter select-boxes dynamically.

## Milestone 3 — Daily Quizzes, Exam Deletion & CSV Import

- [x] Fix Daily Quizzes backend server error (parse payloads gracefully).
- [x] Fix Exam edit/delete logic.
- [x] Add bulk CSV Question Upload in `/admin/questions` with matching backend bulk-upload route.

## Milestone 4 — Admin Syllabus Page & Layout Refinement

- [x] Implement backend Admin Syllabus CRUD endpoints.
- [x] Fixed: Syllabus CRUD routes were not wired up in the router — added the missing import.
- [x] Implement responsive, fully animated `/admin/syllabus` page on the frontend.
- [x] Redesign Admin Announcements Page:
  - [x] Only show the list/table of announcements on the base page.
  - [x] Add a "Create Announcement" button opening a beautiful create/edit modal (Dialog/Sheet).
  - [x] Add edit functionality to announcements via the same modal.
  - [x] Add nice entry and exit Framer Motion animations.
- [x] Apply elegant Framer Motion transitions across all admin pages:
  - [x] Announcements (full animations with staggered rows)
  - [x] Syllabus, Exams, Questions, NCERT, PYP (entry animations)
  - [x] Subjects, Study Notes, Current Affairs, Daily Quizzes (entry animations)
- [x] **Refactored Current Affairs page**: Merged `new/`, `[id]/`, `[id]/edit/` into a single page with Sheet for create/edit, Dialog for detail view, ConfirmDeleteDialog, and full Framer Motion animations.
- [x] **Refactored Daily Quizzes page**: Merged `new/`, `[id]/`, `[id]/edit/` into a single page with Sheet for create/edit, Dialog for detail view, ConfirmDeleteDialog, and full Framer Motion animations.
- [x] **Fixed `adminApi.updateCurrentAffair`**: Was using `PUT` method but backend expects `PATCH` — fixed.
- [x] **Cleaned up `CurrentAffairsTable`**: Removed unused `Link` import and redundant `AlertDialog` delete confirmation (now delegated to `ConfirmDeleteDialog`).
- [x] **Deleted unused sub-page directories**: `current-affairs/new/`, `current-affairs/[id]/`, `daily-quizzes/new/`, `daily-quizzes/[id]/`
- [ ] **Future**: Refactor Exams and Questions pages to follow the same single-page+Sheet pattern (they still have separate `new/` and `[id]/edit/` sub-pages).
