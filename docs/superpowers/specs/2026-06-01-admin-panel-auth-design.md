---
title: Admin Panel Authentication & Data‑Fetching Design
date: 2026-06-01
---

# Overview
The admin panel (`/admin/*`) currently contains UI pages for many resources (PYP, NCERT, Questions, Exams, Students, Analytics, Drafts, Activity Logs, Settings) but only a subset of those pages actually fetch data, and the fetches are performed with plain `fetch` calls that *do not* include the Clerk session cookie. This results in unauthenticated API requests, causing the server to reject them.

The goal of this design is to:
1. **Guarantee authentication** on every admin‑panel request.
2. **Unify data fetching** behind the generated OpenAPI client (`@workspace/api-client-react`).
3. **Expose convenient typed React‑Query hooks** for each admin resource.
4. **Ensure the sidebar routes to all pages** and that each page uses the new hooks.

---

## 1. Authentication Strategy
### Problem
Plain `fetch` in the browser does **not** send cookies unless `credentials` is set to `include`. Clerk stores the session token as a cookie, so the API server expects it on every request.

### Solution
Update the shared `customFetch` helper (used by the generated client) to always include:
```ts
credentials: "include" as RequestCredentials,
```
This flag is safe for browser usage and does **not** affect the Expo scenario because the comment in `custom-fetch.ts` already warns that the getter‑based token mechanism should be used there.

### Impact
* All requests made via `customFetch` (including those from the generated client) will automatically attach the session cookie.
* No code changes are required in individual pages – they will start working once they switch to the client.

---

## 2. Unified Data‑Fetching Layer
### Existing Situation
Admin pages call `fetch` directly, e.g.:
```ts
const res = await fetch(`${API_BASE_URL}/api/document-pyp`);
```
These calls lack typing, error handling, and cache consistency.

### Proposed Layer
1. **Expose the generated client** (`lib/api-client-react/src/generated/api.ts`).
2. **Create thin wrapper functions** in `lib/api-client-react/src/index.ts` that instantiate the client with the base URL.
3. **Develop typed React‑Query hooks** (`useAdminPyp`, `useAdminQuestions`, `useAdminExams`, …) that:
   * Call the client method.
   * Return the `useQuery`/`useMutation` objects.
   * Invalidate related queries on mutation success.
4. **Replace all raw `fetch` calls** in admin pages with the appropriate hook.

### Example Hook
```ts
// lib/api-client-react/src/admin-hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./generated/api"; // generated client

export const useAdminPyp = () => {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["admin", "pyp"],
    queryFn: () => api.getDocumentPyp(), // generated method name
    staleTime: 60_000,
  });
};

export const useDeletePyp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteDocumentPyp({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "pyp"] }),
  });
};
```
All other resources follow the same pattern.

---

## 3. Sidebar Routing
The `NAV` constant already lists every admin route. The file structure under `src/app/(admin)/admin/` matches those routes, so the only required work is:
* Verify each folder contains a `page.tsx` (or `layout.tsx`).
* Add a generic **Not Found** page (`src/app/(admin)/admin/not-found.tsx`) to handle stray routes.
* Ensure the `AdminSidebar` component correctly highlights the active link – it already does via `usePathname`.

---

## 4. Migration Checklist
| Step | Action | Done |
|------|--------|------|
| 1 | Add `credentials: "include"` to `customFetch` | ☐ |
| 2 | Export the generated client from `lib/api-client-react/src/index.ts` | ☐ |
| 3 | Implement admin‑specific React‑Query hooks (`admin-hooks.ts`) | ☐ |
| 4 | Update each admin page to use the new hooks instead of raw `fetch` | ☐ |
| 5 | Verify sidebar navigation works for all pages | ☐ |
| 6 | Add `not‑found.tsx` fallback page | ☐ |
| 7 | Run `pnpm -C src/exam-platform run dev` and smoke‑test all admin pages | ☐ |
| 8 | Commit changes with an appropriate message | ☐ |

---

## 5. Testing & Validation
1. **Manual**: Run the dev server, log in as an admin, click each sidebar link, and confirm data loads without auth errors.
2. **Automated (optional)**: Add Vitest tests for a couple of hooks, mocking `customFetch` to assert the `credentials` option is present.
3. **Lint/Prettier**: `pnpm exec prettier --write .`

---

## 6. Documentation & Future Extensions
* The spec file lives at `docs/superpowers/specs/2026-06-01-admin-panel-auth-design.md`.
* A short **How to add a new admin page** guide will reference the hook pattern.
* Any future admin resource can be added by extending `admin-hooks.ts` and updating `NAV`.

---

**Next steps:**
1. Commit this spec file.
2. Update `customFetch` to include credentials.
3. Implement the admin hooks and migrate pages.

Please review the spec and let me know if any changes are needed before we start implementation.