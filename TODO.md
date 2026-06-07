# TODO — Admin Panel Overhaul and Fixes

## Milestone 1 — Core Core Corrections

- [x] Create global Confirmation Dialog & fix logo stretching in header/sidebar.
- [x] Add missing Syllabus, NCERT Books, and PYP Papers links to Admin Sidebar.
- [x] Relax `min="0"` constraints on negative markings to allow negative numeric entry.
- [ ] Integrate global delete confirmation Dialog into Any Admin panel page that or will have delete functionality (Announcement Page Done )

## Milestone 2 — Dynamic File / URL Upload & Dynamic Subjects

- [x] Support File Upload OR URL input for NCERT, Syllabus, and Study Notes.
- [ ] Consolidate `pyq_subjects` into central `subjects` table schema.
- [ ] Update API backend routes: Rename `/api/admin/pyq-subjects` to `/api/admin/subjects`.
- [ ] Update Admin Sidebar and pages to point to `/admin/subjects` and resolve subject creation bugs.
- [ ] Fetch Subjects dynamically on all admin pages (Exams, Questions, NCERT, PYP, Study Notes) and populate form drop-downs and list filter select-boxes dynamically.

## Milestone 3 — Daily Quizzes, Exam Deletion & CSV Import

- [x] Fix Daily Quizzes backend server error (parse payloads gracefully).
- [x] Fix Exam edit/delete logic.
- [x] Add bulk CSV Question Upload in `/admin/questions` with matching backend bulk-upload route.

## Milestone 4 — Admin Syllabus Page & Layout Refinement

- [ ] Implement backend Admin Syllabus CRUD endpoints.
- [ ] Implement responsive, fully animated `/admin/syllabus` page on the frontend.
- [ ] Redesign Admin Announcements Page:
  - [ ] Only show the list/table of announcements on the base page.
  - [ ] Add a "Create Announcement" button opening a beautiful create/edit modal (Dialog/Sheet).
  - [ ] Add edit functionality to announcements via the same modal.
  - [ ] Add nice entry and exit Framer Motion animations.
- [ ] Apply elegant Framer Motion transitions and premium responsive grid structure across all admin pages.
