# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CareerOS

Career intelligence platform for software engineers. Users declare a target role, skills and milestones; later phases add GitHub evidence, job-market demand and AI-generated guidance. MERN stack, JavaScript only (no TypeScript).

## Current status
- Phases 0-3 complete and tagged: v0.0-phase0, v1.0-phase1a, v1-phase1, v1.1-phase1c, v2-phase2, v3-phase3.
- Phase 3 (GitHub integration) summary: username-based fetching of public data with one server-held token (no OAuth); cached GitHubSnapshot; GitHubPanel; skills-vs-languages evidence (evidenceService, EvidencePanel).
  - Deferred ideas: refresh cooldown, commit-activity evidence, OAuth "Connect GitHub" for ownership proof or private repos, fixing the two pre-existing ESLint errors in Dashboard.jsx.
- Phase 4 (job intelligence) in progress. Decided: user pastes job descriptions; skills are extracted with a curated dictionary (no external job APIs; a live source could be added later as another way to create postings).
  - Done: Step 1 JobPosting model + skillDictionary + skillExtractor; Step 2 /api/jobs routes (list, create, delete).
  - Next: Step 3, gap analysis: skill demand across postings vs declared levels and GitHub evidence (missing, weak, covered).
- Roadmap: 3 GitHub integration; 4 job intelligence (market demand vs profile gap); 5 AI layer (resume parsing, learning roadmaps); 6 interview simulator.
- Update this section whenever a phase closes.

## Stack and environment
- Client: React 19 + Vite, react-router-dom 7, axios. Server: Node 20.17 + Express 5, MongoDB Atlas via Mongoose, JWT (jsonwebtoken) + bcryptjs.
- Windows + PowerShell + VS Code. Repo: github.com/Rohin189/CareerOS, branch main.
- Vite is pinned to 5.4.10 with @vitejs/plugin-react 4.3.4 (Vite 8's rolldown binary fails on Windows). Install with --legacy-peer-deps. Do not upgrade.
- EBADENGINE warnings from ESLint 10 (wants Node >= 20.19) are known and harmless.
- Secrets live in server/.env (gitignored). Never read, print or commit it. The server reads `MONGO_URI`, `JWT_SECRET`, `GITHUB_TOKEN` (fine-grained PAT, public repos read-only) and optional `PORT` (default 5000).
- nodemon does not watch .env; restart the server after changing it. On this machine, stopping a background `npm run dev` can leave orphaned node processes holding port 5000, so kill the whole process tree and confirm the port owner before restarting.
- A stray `mongoose` install exists in C:\Users\RRH\node_modules; server/package.json now declares its own (8.18.1), so resolution is local.

## Commands
- Server (in server/): `npm run dev` (nodemon), API on port 5000.
- Client (in client/): `npm run dev`. Vite proxies `/api` to http://localhost:5000. Also `npm run lint` (ESLint, client only) and `npm run build`.
- No automated tests yet. API is verified with Postman, UI in the browser.

## Structure
- server/server.js: app entry, mounts routes; server/config/db.js connects Mongoose and exits the process on failure
- server/models/: User.js, CareerProfile.js, GitHubSnapshot.js, JobPosting.js
- server/middleware/authMiddleware.js: `protect`, sets req.user (password excluded)
- server/routes/ and server/controllers/: thin HTTP layer
- server/services/: dashboardService.js (pure, exports computeDashboard); evidenceService.js (pure, exports computeGitHubEvidence; skill names matched via normalisation + ALIASES map); githubService.js (all GitHub API access via built-in fetch, exports fetchGitHubData and refreshSnapshot); skillDictionary.js (data: SKILLS with name, category, case-insensitive `patterns`, case-sensitive `exact` for everyday words like React/REST); skillExtractor.js (pure, exports extractSkills(text)); jobService.js (posting CRUD, attaches extracted skills)
- client/src/api/client.js: the only axios instance; baseURL `/api`, attaches Bearer token from localStorage key `token`
- client/src/context/AuthContext.jsx: session state (user, loading, login, register, logout)
- client/src/components/: ProtectedRoute and the dashboard panels
- client/src/pages/: Login, Register, Dashboard. Routes: /login, /register, /dashboard (protected); everything else redirects to /dashboard.

## API (all under /api)
- POST /auth/register, POST /auth/login (returns token), GET /auth/me (protected)
- GET /career, PUT /career (protected): CareerProfile for req.user, created on first access via upsert
- GET /career/dashboard (protected): computed summary (skills, milestones, readiness with breakdown) plus `githubEvidence`: status no-username | not-fetched | stale | ready; when ready, skills[] each evidenced (language, share %, repoCount) | no-evidence (category language, no match) | not-measurable (other categories), and undeclaredLanguages[] (share >= 1%). Evidence never feeds the readiness score.
- GET /github (protected): cached snapshot plus `stale` flag; never calls GitHub. Returns { username, stale, snapshot }.
- POST /github/refresh (protected): fetches for the profile's githubUsername (not the request body) and replaces the snapshot. 400 if no username, 404 unknown user, 429 rate limited, 502 other GitHub failures.
- GET /jobs (protected): user's postings, newest first, each with `skills` extracted on read. POST /jobs { title, company, text } returns 201 (max 50 per user). DELETE /jobs/:id returns 204, or 404 if missing, malformed or another user's.
- GET /health: unauthenticated liveness check.

## Data model
- User: credentials, bcrypt-hashed password.
- CareerProfile (one per user, unique `user` ref, timestamps): targetRole, targetCompanies[], githubUsername ('' = not set, validated against GitHub's username rules), skills[{name, category, level 1-5}], milestones[{title, status planned|in-progress|done, dueDate}].
- Skill category enum: language, framework, tool, cs-fundamentals, soft-skill, other.
- JobPosting (many per user, indexed `user` ref, timestamps): title (required), company, text (required, max 20000). Skills are not stored; they are extracted from text on every read so dictionary improvements apply retroactively.
- GitHubSnapshot (one per user, unique `user` ref): username it was fetched for, fetchedAt, account{publicRepos, followers, createdAt}, repos[] (up to 100, most recently pushed first), languages[{name, bytes}] summed over the 30 most recent non-fork repos. Generated only by refreshSnapshot, never edited by the client. Stale when its username differs (case-insensitively) from the profile's.

## Architecture rules
- Server: logic in services, controllers stay thin, every /api/career, /api/github and /api/jobs route uses `protect`. Per-user documents are always queried by both id and `user`. Server code is CommonJS.
- PUT /career whitelists fields (targetRole, targetCompanies, githubUsername, skills, milestones) and replaces each array it receives in full, so clients must send complete arrays. It runs schema validators; validation failures return 400 with the validator messages as `message`.
- GitHub requests are made sequentially (GitHub penalises concurrent bursts). A refresh costs about 2 + number of sampled repos requests against the token's 5000/hour limit.
- Readiness score (20% completeness, 40% skill strength, 40% milestone progress) is computed server-side only; the client never recomputes it. It measures progress against the user's own plan, not hiring probability.
- Client: ES modules with .jsx. All HTTP goes through src/api/client.js. Dashboard.jsx owns profile, summary and github state; panels are presentational and call `onSave(patch)`, the single profile write path (PUT, then refetch summary, plus /github when the patch includes githubUsername). GitHubPanel's refresh is a separate action, `onRefresh` (POST /github/refresh). Errors show in the sticky banner at the top of the page.

## How to work with me
- Build in small, verifiable steps. Stop after each step so I can test and report before continuing.
- Explain the concept and reasoning before non-trivial code, and state trade-offs.
- Git: commit and push to GitHub (origin main) regularly as work progresses, so no work or status is lost. Commit after each step I have tested and confirmed, as one focused commit per step; do not commit untested work. Before every commit, run `git status` and confirm .env and node_modules are not staged; stage files by name rather than `git add -A`. Never force-push or rewrite pushed history.
- Commit messages: clean and descriptive, format `Phase <N>: <what changed>` (imperative, one line, under ~72 chars), with a short body only when the reason is not obvious. Example: `Phase 3: add GitHub snapshot model and refresh endpoint`.
- Tags: only when a phase is complete, format `v<N>-phase<N>`, pushed with the commit. Update the Current status section in the same commit.
- Debugging: improve the existing code incrementally; do not rewrite files wholesale.
- When I submit my own attempt for review, review it instead of replacing it.
- Formal, professional tone. When giving PowerShell, use single-quoted here-strings only.
