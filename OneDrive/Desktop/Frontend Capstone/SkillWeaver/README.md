# SkillWeaver

**Small steps. Real progress.**

SkillWeaver is a personal learning workspace for students and self-learners. It helps users turn learning goals into manageable tasks, organize priorities, and see how consistently they are moving forward.

Live URL: **Not deployed yet.** Add the production URL here after deployment.

This project is structured as a Module 3 frontend capstone: it demonstrates semantic UI, responsive layout, React components and state, App Router navigation, forms, server/client boundaries, authentication, account-owned data, metadata, and deployment preparation.

## Features

- Account registration and sign-in with hashed passwords.
- Signed, HTTP-only session cookie with a seven-day lifetime.
- Private workspace routes for the dashboard, goals, tasks, progress, and settings.
- Goal and task create, read, update, and delete operations.
- Task completion, priority, due dates, goal linking, search, and filtering.
- Progress calculated from completed tasks rather than manually entered totals.
- Useful empty states for new accounts and no-results views.
- Optional sample workspace that can be loaded into an empty account.
- Responsive desktop sidebar and mobile navigation drawer.
- Server-rendered page data with client components limited to interactive controls.
- Metadata, Open Graph image, `robots.txt`, and `sitemap.xml` routes.
- Five capstone documents: this README, `AUTH.md`, `DATA.md`, `PERF.md`, and `FUTURE.md`.

## Requirements

- Node.js 22 LTS recommended (Node.js 20.9+ is the minimum supported by the selected Next.js line).
- npm 10 or compatible.
- A persistent local filesystem for the JSON data file.

## Run locally

1. Extract the ZIP and open a terminal in the `SkillWeaver` folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Generate a private session secret:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the output into `.env.local` as the value of `SESSION_SECRET`. Do not commit `.env.local`.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000), create an account, and add your first goal.

The JSON database is created automatically at `data/skillweaver.json` on first use. It is ignored by Git. New accounts intentionally begin empty so that empty states can be checked; open **Settings → Load sample workspace** to add illustrative data.

## Useful commands

```bash
npm run dev        # development server
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run build      # optimized production build
npm run start      # run the production build
```

Run `npm run build` before deploying. The production build can reveal issues that a development server may not show.

## Data storage and deployment note

This capstone uses a small JSON file store so that the application can run without an external database or API key. It is useful for local demonstration and a single persistent Node.js instance. It is **not** a production multi-instance database: serverless platforms and ephemeral filesystems may discard writes, and concurrent writes across multiple processes are not coordinated. For a public production deployment, replace `src/lib/db.ts` with PostgreSQL or another managed transactional database, add database migrations/backups, and add platform-level rate limiting. Do not present the local JSON adapter as a horizontally scalable production data layer.

The application uses the Node.js runtime for authentication and data route handlers. Choose a deployment host that supports the Node runtime and a persistent writable volume, or complete the database adapter before deploying to an ephemeral/serverless host.

## Capstone verification checklist

Use the deployed URL, not only localhost, for the final verification pass.

- [ ] Register a new account and sign out/sign in again.
- [ ] Open every private route while signed out; each should redirect to sign-in.
- [ ] Try an unauthenticated write to `/api/goals`; it should return `401`.
- [ ] Create a second account and confirm it cannot read or change the first account's records by guessing or changing an ID.
- [ ] Try a crafted `next=https://example.com` query on `/login`; the app does not honor a return URL and sends successful sign-in to `/dashboard`.
- [ ] Create, edit, complete, filter, and delete goals/tasks.
- [ ] Test a brand-new account with no goals or tasks; empty states should explain what to do next.
- [ ] Test loading and error states, keyboard navigation, and a real phone viewport.
- [ ] Run Lighthouse on the deployed build and record the actual values in `PERF.md`.
- [ ] Confirm the current deployment matches the last commit and `git status` is clean.
- [ ] Clone the repository into a fresh folder and follow these setup instructions.

## Suggested eight-minute presentation

| Time | Demonstration |
|---|---|
| 0–1 min | Explain who SkillWeaver is for and the learning problem it solves. |
| 1–3 min | Walk through the live dashboard, create a goal, add a task, and complete it. |
| 3–5 min | Explain one technical decision: server-side ownership checks and the signed session cookie. |
| 5–6 min | Show the security checks documented in `AUTH.md`. |
| 6–7 min | Present real Lighthouse and responsiveness findings from `PERF.md`. |
| 7–8 min | Explain what you deliberately left out in `FUTURE.md` and what you would build next. |

## Project structure

```text
src/
  app/                 App Router pages, layouts, metadata, and API routes
  components/          Layout, dashboard, goal, task, progress, settings, and auth UI
  lib/                 Authentication, validation, storage, formatting, and types
public/                Open Graph image
 data/                 Runtime JSON storage (generated locally; ignored by Git)
AUTH.md                Authentication routes, checks, and security verification
DATA.md                Data ownership and server/client data decisions
PERF.md                Performance and accessibility budgets / measured results
FUTURE.md              Deliberately deferred scope
```

## Design system

- App date/time zone: `NEXT_PUBLIC_APP_TIME_ZONE` (defaults to `Africa/Addis_Ababa`)
- Primary: `#08BADD`
- Primary text: `#1B7BB6`
- Dark navy: `#0F172A`
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Secondary text: `#64748B`

The visual reference supplied with the project was retained as a layout guide: dark navigation, a clear greeting, summary cards, a focus goal, task list, and learning-goal cards. The capstone brief's emphasis on complete states, private data, and verification was added around that interface.
