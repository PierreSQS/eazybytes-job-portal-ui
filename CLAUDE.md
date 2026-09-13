# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, JS/JSX only)
- `npm run preview` — Preview production build

## MCP Servers

Project-scoped MCP servers are declared in `.mcp.json` (committed, shared with everyone who clones the repo):

| Server | Browser | Purpose |
|---|---|---|
| `playwright` | Chrome (default) | Default browser tool: accessibility snapshots, screenshots, form filling |
| `playwright-firefox` | Firefox (`--browser firefox`) | Cross-browser checks; kept mainly for documentation |

Both start with every Claude Code session. Use `playwright` unless Firefox is explicitly requested.

### Switching a server off without deleting it

Keep the entry in `.mcp.json` (for documentation) and disable it per developer in `.claude/settings.local.json`. That file is personal and not committed (ignored via the global git ignore):

```json
{
  "enabledMcpjsonServers": ["playwright"],
  "disabledMcpjsonServers": ["playwright-firefox"]
}
```

- Remove the server from `enabledMcpjsonServers` **and** add it to `disabledMcpjsonServers`, so the two lists never disagree
- To switch it back on, move the name back into `enabledMcpjsonServers`
- Alternative: toggle a server on/off in the `/mcp` dialog
- Restart Claude Code (`/exit`, then `claude --continue`) for changes to take effect

### Adding a new server

1. Add the entry to `.mcp.json`
2. Restart Claude Code — new servers are only detected at session start
3. Approve the server when prompted, then confirm it shows as connected in `/mcp`

Firefox needs Playwright's own Firefox build (a normal Firefox install won't work). Install it with the Playwright version that `@playwright/mcp` depends on:

```bash
npm view @playwright/mcp@latest dependencies      # shows the playwright version
npx -y playwright@<that-version> install firefox
```

Playwright MCP writes snapshots, console logs and screenshots into `.playwright-mcp/` and the project root; delete them after use.

## Repository Structure

```
job-portal-ui/
├── public/               # Static assets (favicons, company logos)
├── src/
│   ├── components/       # Reusable UI components (Navbar, Footer, Layout, ProtectedRoute, etc.)
│   ├── context/          # Core React contexts: AuthContext, JobContext, ThemeContext
│   ├── contexts/         # Data-fetching contexts: JobsDataContext, CompaniesContext
│   ├── data/             # mockData.js — all seed data (jobs, companies, users)
│   ├── pages/            # Route-level page components
│   │   └── admin/        # Admin-only pages (Dashboard, CompanyManagement, etc.)
│   ├── services/         # Simulated async API service functions
│   ├── utils/            # Shared utilities (delay.js)
│   ├── App.jsx           # Root component — router + provider tree
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles (Tailwind imports)
├── .mcp.json             # Project-scoped MCP servers (Playwright: Chrome + Firefox)
├── eslint.config.js      # ESLint flat config
├── vite.config.js        # Vite configuration
└── index.html            # HTML entry point
```

**Where to look:**

- Adding a new page → `src/pages/` + register route in `App.jsx`
- Shared UI → `src/components/`
- Auth logic → `src/context/AuthContext.jsx`
- Job/application logic → `src/context/JobContext.jsx`
- Mock data changes → `src/data/mockData.js`
- API simulation → `src/services/`

## Git Conventions

### Branching

```
feature/add-job-filter-sidebar         # New features
fix/employer-route-redirect-loop       # Bug fixes
docs/update-readme                     # Documentation only
chore/upgrade-dependencies             # Maintenance, tooling
refactor/simplify-auth-context         # Code refactoring
style/mobile-job-card-spacing          # Visual/style changes
```

- Branch off `main` for all new work
- Keep branches short-lived; open a PR when ready
- Delete branches after merging

### Commit Messages

Follow **Conventional Commits**:

```
feat: add saved jobs count to navbar
fix: correct role guard on employer routes
docs: update README with localStorage keys
chore: upgrade react-router to v7.8
refactor: extract job card into reusable component
style: fix spacing on mobile job list
```

- Use present tense, lowercase, no period at the end
- Keep the subject line under 72 characters
- Add a body for non-obvious changes

### Pull Requests

- PR title should match the commit message format
- Include a summary and test plan in the PR description
- Target `main` as the base branch

## Coding Standards

### General

- **No TypeScript** — plain JSX throughout; do not add `.ts`/`.tsx` files
- **Functional components only** — no class components
- **Named exports** preferred over default exports for components
- Keep components focused — extract reusable pieces into `src/components/`

### Styling

- Use **Tailwind CSS utility classes** exclusively — no inline styles, no CSS modules
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Dark mode via `ThemeContext` — use conditional class toggling, not `dark:` variants

### State & Data

- Use React Context for shared state — no external state library
- Do not fetch data directly in page components; use services in `src/services/`
- All async service calls must use `delay()` to simulate latency
- Persist user-specific data to localStorage using the established key pattern (`{entity}_{userId}`)

### Naming

- Components: `PascalCase` (e.g., `JobCard.jsx`)
- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: match the default export name (e.g., `JobCard.jsx` exports `JobCard`)

### ESLint

Flat config (`eslint.config.js`). The `no-unused-vars` rule ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`). Run `npm run lint` before committing.

## Architecture

React 19 SPA using Vite 7, Tailwind CSS 4, and React Router 7. No TypeScript — plain JSX throughout.

### State Management

Two layers of React Context:

- **`src/context/`** — Core contexts: `AuthContext` (auth + dummy users + localStorage persistence), `JobContext` (applications, saved jobs, employer job CRUD), `ThemeContext`
- **`src/contexts/`** — Data-fetching contexts: `JobsDataContext` (cached job list with 5-min TTL), `CompaniesContext`

Provider nesting order (in App.jsx): AuthProvider → JobsDataProvider → JobProvider → CompaniesProvider → ThemeProvider

### Data Layer

Currently uses **mock data** with localStorage persistence — no real backend. Services in `src/services/` simulate async API calls using `delay()` from `src/utils/delay.js`. Data originates from `src/data/mockData.js`.

Key localStorage keys: `jobPortalUser`, `authToken`, `registeredUsers`, `globalPostedJobs`, `jobApplications_{userId}`, `savedJobs_{userId}`, `postedJobs_{userId}`.

### Routing & Roles

Three roles with route protection via `ProtectedRoute` component:
- **ROLE_JOB_SEEKER** — profile, applied-jobs, saved-jobs
- **ROLE_EMPLOYER** — post-job, employer/jobs, job-applicants/:jobId
- **ROLE_ADMIN** — admin/*, admin pages in `src/pages/admin/`

### Key Libraries

- Font Awesome + Lucide React for icons
- react-toastify for notifications

### ESLint

Flat config (`eslint.config.js`). The `no-unused-vars` rule ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`).
