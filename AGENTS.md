# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

---

## 📦 Repository Overview

- **Monorepo** managed by **pnpm workspaces** (`pnpm-workspace.yaml`).
- Central TypeScript configuration in `tsconfig.base.json` that all packages extend.
- Primary packages:
  - `@workspace/api-client-react` – thin wrapper around the generated OpenAPI client for React Query.
  - `@workspace/api-zod` – Zod schemas for request/response validation.
  - `@workspace/db` – Drizzle‑ORM definitions, migrations and a pre‑configured `db` instance.
  - `@workspace/api-spec` – Orval configuration used to generate the TypeScript client (`lib/api-client-react/src/generated/api.ts`).
- Two main applications:
  - **API Server** (`src/api-server`) – Express server exposing JSON routes (`/pyp`, `/syllabus`, `/mock-tests`, …) and delegating to the `@workspace/db` package.
  - **Exam Platform** (`src/exam-platform`) – Next.js (v15) front‑end using Clerk for auth, Redux Toolkit for global state, React‑Query for data fetching, and Tailwind CSS for styling.
- Utility scripts under `scripts/` (e.g., a simple hello script) and a `post-merge.sh` hook.

---

## 🛠️ Common Development Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Installs all workspace dependencies and links local packages. |
| `pnpm run build` | Runs `typecheck` across all libraries, then builds any package that defines a `build` script (e.g., the Next.js app). |
| `pnpm run typecheck` | Executes `pnpm run typecheck:libs` (type‑checks the library packages) and then type‑checks the two applications (`next typegen && tsc -p tsconfig.json --noEmit`). |
| `pnpm run dev` *(in `src/exam-platform`)* | Starts the Next.js development server on **port 3000** (`next dev --port 3000`). |
| `pnpm run start` *(in `src/exam-platform`)* | Serves the production build of the Next.js app (`next start --port 3000`). |
| `pnpm run dev` *(in `src/api-server`)* | Compiles the server (`pnpm run build`) then launches it (`node --env-file-if-exists=../../.env --enable-source-maps ./dist/index.mjs`). |
| `pnpm run start` *(in `src/api-server`)* | Starts the already‑built Express server (`node --env-file-if-exists=../../.env --enable-source-maps ./dist/index.mjs`). |
| `pnpm run push` *(in `lib/db`)* | Runs `drizzle-kit push --config ./drizzle.config.ts` to apply pending migrations to the Postgres database. |
| `pnpm run push-force` *(in `lib/db`)* | Same as above but forces a migration reset (`--force`). |
| `pnpm run test` | **No test framework is currently configured** – if tests are added, the typical pattern would be `pnpm run test` or `pnpm run test:watch`. |

*Note:* Most commands are defined in the individual `package.json`s. Use `pnpm -C <package> run <script>` to run a script in a specific workspace package (e.g., `pnpm -C src/api-server run dev`).

---

## 🏗️ High‑Level Architecture

```
root
├─ pnpm-workspace.yaml          # workspace definition
├─ tsconfig.base.json           # shared TS compiler options
├─ lib/                         # reusable libraries (internal packages)
│   ├─ api-client-react/        # React‑Query wrapper + generated client
│   ├─ api-spec/                # Orval OpenAPI spec & generator config
│   ├─ api-zod/                 # Zod schema definitions
│   └─ db/                      # Drizzle ORM models & migrations
├─ src/                         # Applications
│   ├─ api-server/              # Express API server
│   │   ├─ src/                 # routes, middlewares, logger, etc.
│   │   └─ tsconfig.json       # extends tsconfig.base.json
│   └─ exam-platform/           # Next.js front‑end
│       ├─ src/                 # pages, components, layout, API hooks
│       ├─ app/                 # Next.js 13+ app directory (including admin UI)
│       └─ tsconfig.json       # extends tsconfig.base.json
└─ scripts/                     # misc CLI utilities
```

### Data Flow

1. **OpenAPI Spec** (`lib/api-spec/openapi.yaml`) → generated client (`lib/api-client-react/src/generated/api.ts`).
2. **Front‑end** uses **React‑Query** (`@workspace/api-client-react`) to call the API server endpoints.
3. **API Server** (`src/api-server`) imports the **DB layer** (`@workspace/db`) and **Zod schemas** (`@workspace/api-zod`) for validation.
4. **Authentication** is handled by **Clerk** (`@clerk/nextjs` on the front‑end, `@clerk/express` on the server) – the server trusts the `sessionToken` passed from the client.
5. Global state (e.g., selected mock test) is managed with **Redux Toolkit**; UI components are built with **Tailwind CSS**, **Radix UI**, and **Lucide icons**.

### Key Technical Choices

- **TypeScript** with strict checks (see `tsconfig.base.json`).
- **pnpm workspaces** for zero‑install local linking.
- **Drizzle‑ORM** + **PostgreSQL** for type‑safe database access.
- **Zod** for runtime schema validation.
- **Next.js 15** (app router) for the front‑end, enabling edge‑runtime APIs and server components.
- **Clerk** for authentication (both client‑side and server‑side guards).
- **React‑Query** for data fetching & caching; the generated client is thin and typed.
- **Redux Toolkit** for UI‑level state that persists across pages.
- **Tailwind CSS + Radix UI** for accessible component primitives.

---

## 📄 Project‑Specific Guidance

- **Environment variables** are loaded via `--env-file-if-exists=../../.env` when running the API server. Ensure a `.env` file at the repository root contains the required DB connection string and Clerk keys.
- **Database migrations** must be run (`pnpm -C lib/db run push`) before starting the API server for the first time.
- **Generating the API client**: after modifying `lib/api-spec/openapi.yaml`, run `pnpm -C lib/api-spec run generate` (the script is defined in the `orval` config) – the generated files live under `lib/api-client-react/src/generated/`.
- **Linting / Formatting**: The repo uses **Prettier** (via the `prettier` dev dependency). Run `pnpm exec prettier --write .` if you need to reformat files. No separate ESLint configuration is present.
- **Testing**: No testing framework is currently set up. Adding `jest` or `vitest` at the workspace root and creating test files under a `__tests__` directory in each package is the recommended approach.

---

## 📚 Helpful Files to Reference

- `pnpm-workspace.yaml` – defines which directories are part of the workspace.
- `tsconfig.base.json` – shared compiler options.
- `lib/api-spec/openapi.yaml` – source of truth for the public API.
- `src/api-server/src/routes/*.ts` – Express route implementations.
- `src/exam-platform/src/app/(admin)/*` – admin dashboard pages.
- `src/exam-platform/src/components/**` – UI component library (Radix, Tailwind, Lucide).

---
