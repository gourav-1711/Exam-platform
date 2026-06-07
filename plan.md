# Plan — Admin Panel Refactor & Fixes

## 1. Global Confirmation Dialog & Logo Fixes
- Create a beautiful reusable Confirmation Dialog component using Shadcn `AlertDialog` in frontend components.
- Fix logo alignment and styling in `AdminSidebar` and `Header` to prevent stretching.
- Expand sidebar links to include NCERT Books, PYP Papers, and Syllabus.
- Ensure the delete confirmation dialog is integrated into all delete operations (including Announcements, PYQ Subjects, etc.).

## 2. Dynamic NCERT/Syllabus/Study Notes (File Upload OR URL Input)
- Support BOTH File Upload or URL input on Study Notes, NCERT, and Syllabus forms.
- If a URL is supplied, store it directly in the respective columns (`cloudinaryUrl`/`downloadUrl`/`readUrl`).

## 3. Consolidation to Central Subjects Table & Route Updates
- Migrate all endpoints and frontend components from using `pyq_subjects` to the central `subjects` table (`lib/db/src/schema/subjects.ts`).
- Update the API server endpoints: Rename `/api/admin/pyq-subjects` to `/api/admin/subjects`.
- Fix creation, updating, and deletion of subjects. Ensure subjects are dynamically loaded for all filters/forms.
- Update sidebar and router views: `/admin/pyq-subjects` becomes `/admin/subjects`.

## 4. Bulk Question Upload via CSV
- Implement a robust Question CSV uploader under `/admin/questions` using `papaparse`.
- Add an API endpoint `POST /api/admin/questions/bulk-upload` in the backend to bulk-insert questions.

## 5. Daily Quizzes & Exam Fixes
- Fix the `dailyQuiz` schema parsing issues in backend `/api/admin/daily-quiz`. Ensure integers/booleans parse correctly.
- Fix Exam Edit & Delete flows, ensuring they match correctly and the delete endpoint removes joins before deleting the exam paper.
- Allow entering negative values or positive penalties freely without strict `min="0"` constraints on inputs.

## 6. Syllabus Admin Page & CRUD Routes
- [x] Add backend routes `GET /api/admin/syllabus`, `POST /api/admin/syllabus`, `PATCH /api/admin/syllabus/:id`, and `DELETE /api/admin/syllabus/:id`.
- [x] Build a responsive `/admin/syllabus` CRUD page.
- [x] **Fixed**: Syllabus router was missing from admin route index — added import and mount.

## 7. Refactor Admin Pages to Announcements Pattern
- [x] Redesign the Announcements admin page with Sheet for create/edit, Dialog, ConfirmDeleteDialog, and animations.
- [x] **Current Affairs**: Merged `new/`, `[id]/`, `[id]/edit/` sub-pages into a single page with Sheet (create/edit), Dialog (detail), ConfirmDeleteDialog, and full Framer Motion animations.
- [x] **Daily Quizzes**: Merged `new/`, `[id]/`, `[id]/edit/` sub-pages into a single page with Sheet (create/edit), Dialog (detail), ConfirmDeleteDialog, and animations.
- [x] Fixed `adminApi.updateCurrentAffair` PUT→PATCH bug (was silently failing).
- [x] Cleaned up `CurrentAffairsTable`: removed unused imports and duplicate delete confirmation.
- [x] Deleted orphaned `DailyQuizzesAdmin.tsx` and unused sub-page directories.
- [ ] **Future**: Refactor Exams and Questions pages (they still have separate `new/` and `[id]/edit/` sub-pages with complex forms).