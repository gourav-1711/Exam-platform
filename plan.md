# Plan — Admin Panel Refactor & Fixes

## 1. Global Confirmation Dialog & Logo Fixes
- Create a beautiful reusable Confirmation Dialog component using Shadcn `AlertDialog` in frontend components.
- Fix logo alignment and styling in `AdminSidebar` and `Header` to prevent stretching.
- Expand sidebar links to include NCERT Books, PYP Papers, and Syllabus.

## 2. Dynamic NCERT/Syllabus/Study Notes (File Upload OR URL Input)
- Support BOTH File Upload or URL input on Study Notes, NCERT, and Syllabus forms.
- If a URL is supplied, store it directly in the respective columns (`cloudinaryUrl`/`downloadUrl`/`readUrl`).

## 3. Dynamic Subjects & Filters
- Fetch subjects dynamically from `/api/admin/pyq-subjects` or `/api/pyq/subjects` and populate all form dropdowns and list filter select-boxes dynamically.
- Update filters on admin list pages (Questions, Exams, NCERT, PYP, Study Notes) to trigger React Query refetches with search/category/status parameters.

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

## 7. Responsive Styling & Animations
- Ensure perfect responsive styling and grids across all admin pages.
- Add gorgeous entrance transition animations with Framer Motion.