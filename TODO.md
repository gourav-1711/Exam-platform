# TODO — Admin Panel Overhaul and Fixes

## Milestone 1 — Core Core Corrections
- [x] Create global Confirmation Dialog & fix logo stretching in header/sidebar.
- [x] Add missing Syllabus, NCERT Books, and PYP Papers links to Admin Sidebar.
- [x] Relax `min="0"` constraints on negative markings to allow negative numeric entry.

## Milestone 2 — Dynamic File / URL Upload & Dynamic Subjects
- [x] Support File Upload OR URL input for NCERT, Syllabus, and Study Notes.
- [x] Fetch Subjects dynamically on all admin pages and populate drop-downs.
- [x] Fix filters on all admin pages to trigger active search/filter refetching.

## Milestone 3 — Daily Quizzes, Exam Deletion & CSV Import
- [x] Fix Daily Quizzes backend server error (parse payloads gracefully).
- [x] Fix Exam edit/delete logic.
- [x] Add bulk CSV Question Upload in `/admin/questions` with matching backend bulk-upload route.

## Milestone 4 — Admin Syllabus Page & Layout Refinement
- [ ] Implement backend Admin Syllabus CRUD endpoints.
- [ ] Implement responsive, fully animated `/admin/syllabus` page on the frontend.
- [ ] Apply elegant Framer Motion transitions and premium responsive grid structure across all admin pages.