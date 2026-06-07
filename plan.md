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
- Add backend routes `GET /api/admin/syllabus`, `POST /api/admin/syllabus`, `PATCH /api/admin/syllabus/:id`, and `DELETE /api/admin/syllabus/:id`.
- Build a responsive `/admin/syllabus` CRUD page.

## 7. Responsive Styling & Animations + Redesigned Announcements Page
- Redesign the Announcements admin page:
  - Keep only the table of announcements on the main view.
  - Add a "Create Announcement" button that opens a beautiful modal (Dialog/Sheet) using Shadcn and Framer Motion.
  - Ensure the "Edit" button opens the same modal populated with the announcement's current data.
  - Implement full CRUD operations for announcements in the modal view.
- Ensure perfect responsive styling and grids across all admin pages.
- Add gorgeous entrance transition animations with Framer Motion.