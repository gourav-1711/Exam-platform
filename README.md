# Exam Platform - Full Stack Application

A comprehensive exam platform built with Next.js 15, Express, PostgreSQL, and Drizzle ORM, featuring NCERT book management, previous year papers (PYP), quizzes, and mock tests.

## Architecture Overview

### Port Assignments

- **Frontend:** `http://localhost:8080` (Next.js 15 app)
- **Backend API:** `http://localhost:4000` (Express server)
- **Database:** PostgreSQL (configured via `DATABASE_URL`)

### Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Clerk Auth
- **Backend:** Express 5, TypeScript, Drizzle ORM, PostgreSQL, Cloudinary
- **Database:** PostgreSQL with Drizzle schema management
- **File Storage:** Cloudinary (all PDFs, documents stored in cloud)
- **Security:** Helmet, CORS, Rate Limiting, bcrypt for PIN hashing

## Project Structure

```
Exam-platform/
├── src/
│   ├── api-server/           ← Express API server (port 4000)
│   │   ├── src/
│   │   │   ├── config/       ← Cloudinary, environment validation
│   │   │   ├── middleware/   ← Auth, rate limiting, file upload
│   │   │   ├── routes/       ← API endpoints
│   │   │   └── lib/          ← Database, utilities
│   │   └── package.json
│   └── exam-platform/        ← Next.js frontend (port 8080)
│       ├── src/
│       │   ├── app/          ← Next.js App Router pages
│       │   ├── components/   ← React components
│       │   ├── lib/          ← Utilities, API config
│       │   └── store/        ← Redux state management
│       └── package.json
├── lib/
│   ├── db/                   ← Drizzle schema & client
│   └── api-zod/              ← Zod validation schemas
└── .env.example              ← Environment variables template
```

## Workspace & File Details

This section lists each workspace/package and the important files you will interact with while developing, plus where generated code lives.

- **Root workspace**: repository orchestration, pnpm workspace config and top-level scripts
  - `package.json` — root scripts (bootstrap, build, typecheck helpers)
  - `pnpm-workspace.yaml` — workspace package globs
  - `tsconfig.base.json` — shared TypeScript compiler options
  - `tsconfig.json` — workspace-level TypeScript project used by CI and `pnpm build`
  - `README.md`, `QUICKSTART.md` — developer docs

- **lib/api-spec/**: OpenAPI source and Orval config
  - `openapi.yaml` — canonical OpenAPI v3 spec for the backend API. Edit here when adding or changing endpoints.
  - `orval.config.ts` — Orval configuration that controls how clients and Zod schemas are generated. See the "Orval generation" section below for details.
  - `package.json` — contains the `codegen` script that runs Orval (run with `pnpm -C lib/api-spec run codegen`).

  - `package.json` / `tsconfig.json` — package config for building this library
  - `src/custom-fetch.ts` — request mutator used by Orval generated client; exposes `setBaseUrl()` and `setAuthTokenGetter()` for runtime configuration.
  - `src/index.ts` — wrapper exports used by the frontend app
  - `src/admin-hooks.ts` — convenience hooks that call the generated client for admin flows
  - `src/generated/` — Orval output for the React Query client (committed). Key files:
    - `api.ts` — generated API functions, split-mode multiple files
    - `api.schemas.ts` / `types/*` — generated type declarations

- **lib/api-zod/**: Zod schemas generated from OpenAPI
  - `src/generated/` — Orval-generated Zod schemas and type helpers used for runtime validation when needed

- **lib/db/**: Drizzle models, migrations and DB client
  - `drizzle.config.ts` — Drizzle CLI config
  - `src/schema/` — table definitions (one file per domain area, e.g. `ncert.ts`, `pyp.ts`, `quizzes.ts`)
  - migrations are produced by `drizzle-kit` and applied with the `push` script (see package scripts in `lib/db/package.json`).

- **src/api-server/**: Express API server
  - `src/app.ts` — Express app configuration (middlewares, routes wiring)
  - `src/index.ts` — server bootstrap (reads env, starts the app)
  - `src/routes/` — all route handlers (grouped by feature: `pyp`, `ncert`, `quizzes`, `admin`, etc.)
  - `src/middleware/` and `src/middlewares/` — request-level middleware (auth, rate limit, file upload)
  - `src/lib/` — helpers (db client wrapper, cache, logger)

- **src/exam-platform/**: Next.js frontend (App Router)
  - `next.config.ts`, `postcss.config.mjs`, `tsconfig.json` — app build configuration
  - `src/app/` — App Router entry points, layout and route groups (`(admin)`, `(app)`, auth pages)
  - `src/components/` — UI components split by domain: `admin`, `layout`, `shared`, `ui`
  - `src/store/` — Redux Toolkit slices used by the app

- **scripts/**: small utility scripts and dev tools (CI helpers, post-merge hooks)

- **docs/**: design and spec notes (e.g. admin-panel auth design under `docs/superpowers/specs/`)

If you need to find a file quickly, use the workspace search in VS Code or `pnpm -w -C <package> run <script>` to run per-package scripts.

## Orval generation (OpenAPI → generated clients & Zod)

Orval is used to generate two artifacts from `lib/api-spec/openapi.yaml`:

- The front-end now uses a local API facade under `src/exam-platform/src/lib/api` for React Query hooks and fetch helpers.
- Zod schemas and TypeScript types placed into `lib/api-zod/src/generated` (configured as `client: "zod"`, with `schemas.path: "generated/types"`).

How to regenerate after editing the OpenAPI spec:

1. Edit `lib/api-spec/openapi.yaml` (add/modify paths, components, schemas).
2. From repository root run:

   ```bash
   pnpm -C lib/api-spec run codegen
   ```

   This runs `orval --config ./orval.config.ts`. The `codegen` script in `lib/api-spec/package.json` also triggers a top-level typecheck for the libraries to catch issues early.

3. After Orval runs you'll see updated files under:
   - `src/exam-platform/src/lib/api/` (React Query hooks and fetch helpers)
   - `lib/api-zod/src/generated/` (Zod schemas + types)

Notes about the Orval configuration (`lib/api-spec/orval.config.ts`):

- `workspace` + `target` control where generated files are written; the config uses absolute workspace paths so generation is robust from the repo root.
- `mode: 'split'` creates smaller per-endpoint files rather than a single large file.
- The React Query client is hooked to `custom-fetch.ts` via `override.mutator`, so the generated code calls `customFetch()` rather than raw `fetch`.
- `clean: true` means Orval will remove stale files in the `target` folder before writing new output.

Best practices:

- Keep `openapi.yaml` as the single source of truth for the API surface.
- Make small, reversible changes and run `pnpm -C lib/api-spec run codegen` locally to validate TypeScript output.
- Commit generated artifacts only if you want consumers (the Next.js app or other packages) to import them without running codegen; otherwise add them to `.gitignore` and run codegen in CI.

## Getting Started

### Prerequisites

1. **Node.js** 18+ with pnpm package manager
2. **PostgreSQL** database (local or cloud)
3. **Cloudinary** account (free tier sufficient)
4. **Clerk** account for authentication

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd Exam-platform
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:

   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/exam_db?sslmode=require

   # API Server
   API_PORT=4000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

   # Clerk Authentication
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

   # Cloudinary (sign up at cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Frontend API
   NEXT_PUBLIC_API_URL=http://localhost:4000
   API_URL=http://localhost:4000
   ```

3. **Install dependencies:**

   ```bash
   pnpm install
   ```

4. **Set up the database:**

   ```bash
   # Create/migrate database schema
   pnpm drizzle-kit push
   ```

5. **Set the admin PIN (first time only):**
   - Start both servers (see below)
   - Navigate to `http://localhost:8080/admin`
   - You'll be prompted to enter a PIN to access the admin panel

6. **Run development servers:**

   ```bash
   # Terminal 1: API Server
   cd src/api-server && pnpm dev

   # Terminal 2: Frontend
   cd src/exam-platform && pnpm dev
   ```

   Or run both concurrently from root:

   ```bash
   pnpm -r run dev
   ```

## Features

### Public Pages (No Authentication Required)

#### NCERT Books (`/ncert-books`)

- Browse NCERT textbooks by class (1-12) and subject
- Filter by subject and class number
- Direct download from Cloudinary CDN
- Clean, responsive card-based interface

#### Previous Year Papers (`/pyp`)

- Access exam papers from multiple years
- Filter by exam type (JEE Main, NEET, CBSE Board, etc.)
- Filter by subject and year
- Download PDFs directly

### Admin Panel (`/admin`) - PIN-Protected

#### PIN Authentication

- Unique admin PIN gates access to all admin features
- PIN verified via `POST /api/document-admin/verify-pin`
- Session-based verification stored in `sessionStorage`
- Change PIN in Settings page with current PIN verification

#### Dashboard (`/admin`)

- Overview of uploaded documents
- Statistics on NCERT and PYP papers
- Quick navigation to management pages

#### NCERT Management (`/admin/ncert`)

- **Upload Form:**
  - Title, Subject (Physics, Chemistry, Mathematics, etc.), Class (1-12)
  - File upload with drag-and-drop support
  - Validates file type (PDF/DOCX only)
  - Sends file + PIN header to `/api/document-ncert/upload`
- **PDF List Table:**
  - View all uploaded NCERT books
  - Download button → opens Cloudinary URL
  - Delete button → removes from DB and Cloudinary
  - Displays file size and upload date

#### PYP Management (`/admin/pyp`)

- **Upload Form:**
  - Title, Subject, Year (dropdown), Exam Type (JEE/NEET/Board/etc.)
  - Similar file upload and validation
  - Posts to `/api/document-pyp/upload`
- **PDF List Table:**
  - All PYP papers with exam type and year filters
  - Download and delete functionality

#### Settings (`/admin/settings`)

- **Change Admin PIN:**
  - Requires current PIN for security
  - New PIN must be at least 4 characters
  - PIN stored as bcrypt hash in database
  - Success/error feedback

## API Endpoints

### Document Management

#### NCERT Books

- `GET /api/document-ncert` - List all NCERT PDFs (public)
- `POST /api/document-ncert/upload` - Upload NCERT PDF (requires `x-admin-pin` header)
- `DELETE /api/document-ncert/:id` - Delete NCERT PDF (requires `x-admin-pin` header)

#### Previous Year Papers

- `GET /api/document-pyp` - List all PYP PDFs (public)
- `POST /api/document-pyp/upload` - Upload PYP PDF (requires `x-admin-pin` header)
- `DELETE /api/document-pyp/:id` - Delete PYP PDF (requires `x-admin-pin` header)

#### Admin PIN Management

- `POST /api/document-admin/verify-pin` - Verify admin PIN
- `POST /api/document-admin/set-pin` - Set or change admin PIN

## Database Schema

### Admin Settings

```sql
admin_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### NCERT PDFs

```sql
ncert_pdfs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_number INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
)
```

### PYP PDFs

```sql
pyp_pdfs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  year INTEGER NOT NULL,
  exam_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
)
```

## Security Features

### Backend Security

- **Helmet:** Sets secure HTTP headers (CSP, X-Frame-Options, etc.)
- **CORS:** Restricted to configured origins only
- **Rate Limiting:**
  - Global: 200 requests per 15 minutes
  - Auth/Admin endpoints: 20 requests per 15 minutes
- **HPP:** HTTP Parameter Pollution protection
- **Request Validation:** Zod schemas for all inputs
- **Admin PIN:** Bcrypt-hashed, required for file operations

### Frontend Security

- **Clerk Auth:** Handles user authentication and session management
- **PIN Storage:** Session-based, never persisted to localStorage permanently
- **Header-based Auth:** Admin PIN sent via `x-admin-pin` header on each request

## Cloudinary Setup

1. **Create a Cloudinary Account:**
   - Visit [cloudinary.com](https://cloudinary.com)
   - Sign up for free tier account

2. **Get API Credentials:**
   - Dashboard → Settings → API Keys
   - Copy: Cloud Name, API Key, API Secret

3. **Create Upload Preset (Optional):**
   - Settings → Upload → Add upload preset
   - Name: `exam-platform`
   - Set to "Unsigned"

4. **Folder Organization:**
   - All files automatically organized in folders:
     - `exam-platform/ncert/` - NCERT books
     - `exam-platform/pyp/` - Previous year papers

## Development Workflow

### Making API Changes

1. Update Drizzle schema in `lib/db/src/schema/`
2. Run `pnpm drizzle-kit generate` to create migration
3. Run `pnpm drizzle-kit push` to apply schema
4. Update API routes in `src/api-server/src/routes/`
5. Run `pnpm typecheck` to verify types

### Adding New Pages

1. Create page in `src/exam-platform/src/app/`
2. Use existing API config: `import { API_BASE_URL } from '@/lib/api-config'`
3. Fetch data with TanStack Query: `useQuery`
4. Use Tailwind CSS for styling (dark theme tokens provided)

### Building for Production

```bash
# Build all packages
pnpm build

# Type check
pnpm typecheck

# Start servers
cd src/api-server && pnpm start
cd src/exam-platform && pnpm start
```

## Troubleshooting

### API Connection Issues

- Ensure `NEXT_PUBLIC_API_URL=http://localhost:4000` is set
- Check that API server is running on port 4000
- Verify CORS origins in `ALLOWED_ORIGINS`

### Cloudinary Upload Failures

- Verify credentials in `.env` are correct
- Check Cloudinary account is active and not rate-limited
- Ensure file size < 50MB
- Only PDF and DOCX files are allowed

### Admin PIN Issues

- First time: Visit `/admin` to set PIN
- Forgot PIN: Contact database admin to reset `admin_settings` table
- Session expired: Refresh page and re-enter PIN

### Database Errors

- Check `DATABASE_URL` connection string is correct
- Ensure PostgreSQL server is running
- Run migrations: `pnpm drizzle-kit push`

## Environment Variables Reference

| Variable              | Required | Description                            |
| --------------------- | -------- | -------------------------------------- |
| DATABASE_URL          | ✓        | PostgreSQL connection string           |
| API_PORT              | ✓        | Express API port (default: 4000)       |
| NODE_ENV              | ✓        | Environment (development/production)   |
| CLERK_SECRET_KEY      | ✓        | Clerk backend secret                   |
| CLOUDINARY_CLOUD_NAME | ✓        | Cloudinary cloud name                  |
| CLOUDINARY_API_KEY    | ✓        | Cloudinary API key                     |
| CLOUDINARY_API_SECRET | ✓        | Cloudinary API secret                  |
| ALLOWED_ORIGINS       | -        | CORS allowed origins (comma-separated) |
| NEXT_PUBLIC_API_URL   | -        | Frontend API URL                       |
| API_URL               | -        | Server-side API URL                    |

## Performance Optimization

- **TanStack Query:** Automatic caching and refetching
- **Cloudinary CDN:** Automatic image optimization and caching
- **Rate Limiting:** Protects API from abuse
- **bcrypt Hashing:** Password-strength PIN hashing

## License

MIT

## Support

For issues or feature requests, please open an issue or contact the development team.
