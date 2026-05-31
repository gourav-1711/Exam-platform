---
name: esbuild zod/v4 resolution
description: Why api-server routes can't import zod/v4 directly and how to fix it.
---

# esbuild zod/v4 Resolution Quirk

## The rule
API server route files must import from `"zod"`, NOT `"zod/v4"`. Also requires `zod: "catalog:"` in `artifacts/api-server/package.json` dependencies.

**Why:** `lib/db` exports its TypeScript source directly (`"exports": { ".": "./src/index.ts" }`). esbuild bundles it and can resolve `zod/v4` because `lib/db` has `zod` in its own deps — pnpm symlinks it for lib/db's context. But when esbuild processes `artifacts/api-server/src/routes/...` files that import `zod/v4`, it resolves from the api-server package context, where zod is NOT a declared dependency. This causes `Could not resolve "zod/v4"` build failure.

**How to apply:** Whenever adding a new api-server route file that needs Zod, use `import { z } from "zod"` and ensure `zod: "catalog:"` is in `artifacts/api-server/package.json` dependencies. Do NOT add `"zod"` to build.mjs externals — that causes a runtime `Cannot find package 'zod'` error because the ESM bundle can't resolve hoisted workspace packages at runtime.

**lib/db schemas** can continue using `"zod/v4"` — they're compiled in their own package context where zod is available.
