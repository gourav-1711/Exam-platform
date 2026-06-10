# TODO

## Plan implementation checklist

### 1) Public `/api/document-ncert`

- [ ] Inspect `src/api-server/src/index.ts` and auth middleware mounting.
- [ ] Ensure `/api/document-ncert` (and any other public doc routes) bypass auth.
- [ ] Add/update tests if present.

### 2) Fix `NcertMcqPlayer` Hooks crash

- [ ] Refactor `src/exam-platform/src/views/NcertMcqPlayer.tsx` so hooks are unconditional.
- [ ] Keep auth gating via conditional rendering only (no conditional hooks).

### 3) Implement 2 global MCQ players

- [ ] Create `GlobalMcqPlayerNcertPyq` component (timer, modes, no early correct answer reveal).
- [ ] Create `GlobalMcqPlayerTestDaily` component (timer, timer auto-submit/finish, DB save).
- [ ] Wire existing pages to use the new components.
- [ ] Ensure “submit/finish” triggers DB save and UI transitions reliably.

### 4) DialogTitle accessibility

- [ ] Find `AlertDialogContent` usages missing `AlertDialogTitle`.
- [ ] Add `AlertDialogTitle` (or `VisuallyHidden`) where required.

### 5) Package.json test commands

- [ ] Update root `package.json` and/or `src/api-server/package.json` with proper `test` scripts.
- [ ] Verify commands run.

### 6) UI match to provided screenshots

- [ ] Update `CurrentAffairDetail` to match `ui_images/current_affairs_details_page.jpg`.
- [ ] Update daily quiz detail page to match `ui_images/daily_quiz_detail.jpg`.
- [ ] Update NCERT MCQ player UI to match `ui_images/ncert_mcq.jpg`.
- [ ] Update PYQ MCQ player UI to match `ui_images/pyq_page.jpg`.
- [ ] Update daily quiz listing to match `ui_images/daily_free_quiz_page.jpg`.
- [ ] Update PYQ listing page to match `ui_images/all_pyq_page.jpg`.
- [ ] Ensure responsiveness across breakpoints.
