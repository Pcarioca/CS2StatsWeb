# CS2Stats — Project Documentation (Assignment 1 + Feature Checklist)

> Replace the placeholders in **Team** and **Repository** before submission.

## Repository
- Git repository: **`<PASTE_YOUR_GIT_REPO_LINK_HERE>`**

## Team (3 students)
- Student 1: **`<NAME>`** — Frontend/UI & UX
- Student 2: **`<NAME>`** — Backend/API & Database
- Student 3: **`<NAME>`** — Auth/Integrations, DevOps & Testing

## Project Description
CS2Stats is a web application for tracking Counter-Strike 2 matches in real time. Users can browse matches, teams, and players, view match timelines and stats, read news, and interact via comments. Authenticated users can manage favorites and settings. Admin/moderator roles can manage content and moderate comments.

## Technology Stack
- Frontend: React + Vite, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui (Radix UI)
- Backend: Node.js + Express, WebSockets (`ws`)
- Database: PostgreSQL + Drizzle ORM + Drizzle Kit migrations
- Auth: Email/password (local) + Google OAuth (Passport)
- Storage: S3-compatible storage via server provider (local fallback)
- Email: SMTP via Nodemailer (registration + event notifications)

## Architecture Overview
- **Client** (`client/`): React SPA (pages, components, hooks)
- **Server** (`server/`): Express REST API + WebSocket server + auth middleware
- **Shared** (`shared/`): Shared types and Drizzle schema used by both client/server

**Main runtime flows**
- Browser calls REST endpoints under `/api/*` for lists and CRUD.
- Browser opens a WebSocket to `/ws` for real-time match updates/events.
- Auth uses sessions stored in Postgres (if configured) or in-memory store (dev).

## Requirements Checklist (Course Rubric)

### 1) Web application using a framework
Met: React (frontend) + Express (backend).

### 2) Team of 3
Documentation requirement: include all 3 team members in this file (see **Team** section).

### 3) Documentation for Assignment 1 (week 5/6)
This document contains:
- Project description
- Actors
- Use cases (≥ 9 total, ≥ 3 per student)
- Repository link placeholder

### 4) Progress for Assignment 2 (week 11/12)
Met in code: you can demonstrate at least 4 working features (examples below).

### 5) Key features (must-have)

#### Social login (Google / Facebook / or email+password)
Met:
- Google OAuth: `GET /api/auth/google` and callback `GET /api/auth/google/callback`
- Email/password:
  - `POST /api/auth/register`
  - `POST /api/auth/login`

#### Store + retrieve elements from a database
Met:
- PostgreSQL + Drizzle ORM. Entities include:
  - users, sessions
  - teams, players, matches
  - match_events, match_player_stats
  - news_articles
  - comments, comment_flags
  - favorites, notifications, user_settings

> Note: If `DATABASE_URL` is not set, the app runs with in-memory storage for demo purposes.

#### Real-time data synchronization
Met:
- WebSocket server at `/ws`
- Broadcasts match updates and match events
- Client reconnects automatically (`client/src/hooks/useWebSocket.ts`)

#### Storage service for images/audio/video
Met:
- Upload endpoint: `POST /api/upload` (multipart form-data)
- Storage provider supports S3 if configured (recommended for rubric compliance), otherwise local fallback.

#### Send an email when an event happens
Met:
- Registration email (when SMTP is configured)
- Event notifications (optional) when match events are created and `NOTIFY_EMAILS` is set

## Actors
- **Visitor (unauthenticated)**: can browse public pages (matches, teams, players, leaderboards, news).
- **Registered User**: can log in, comment, manage favorites, view profile/settings.
- **Admin**: can create/update/delete core entities (matches, teams, players, news).
- **Moderator**: can review flags and moderate comments.
- **Google OAuth Provider**: authenticates user identity and returns profile/email.
- **SMTP Provider**: sends registration/notification emails.
- **Database (PostgreSQL)**: persists app data.
- **Storage Provider (S3-compatible)**: stores uploads (images/audio/video).

## Use Cases (≥ 9 sea-level use cases)

### Student 1 — Frontend/UI & UX (3+)

**UC-01: Browse matches**
- Primary actor: Visitor / Registered User
- Goal: View live/upcoming/finished matches and filter/search by tournament.
- Preconditions: None
- Main success scenario:
  1. Actor opens `/matches`.
  2. System fetches `GET /api/matches`.
  3. Actor filters by status and searches by tournament text.
  4. System renders filtered match cards and links to details.

**UC-02: View match details**
- Primary actor: Visitor / Registered User
- Goal: Inspect scoreboard, timeline events, player stats, and comments for a match.
- Preconditions: Match exists
- Main success scenario:
  1. Actor opens `/matches/:id`.
  2. System fetches `GET /api/matches/:id`, `GET /api/matches/:id/events`, `GET /api/matches/:id/stats`, `GET /api/comments?matchId=:id`.
  3. Actor switches between Timeline / Player Stats / Comments tabs.

**UC-03: Browse teams and players**
- Primary actor: Visitor / Registered User
- Goal: Discover teams and players, search, and navigate to profiles.
- Preconditions: None
- Main success scenario:
  1. Actor opens `/teams` or `/players`.
  2. System fetches `GET /api/teams` and/or `GET /api/players`.
  3. Actor searches and navigates through lists and profiles.

### Student 2 — Backend/API & Database (3+)

**UC-04: Admin creates/updates matches**
- Primary actor: Admin
- Goal: Create matches and update scores/status.
- Preconditions: Admin authenticated
- Main success scenario:
  1. Admin submits match creation or update request.
  2. System validates payload with Zod schema (`shared/schema.ts`).
  3. System stores changes in DB and broadcasts updates via WebSocket.

**UC-05: Admin uploads media**
- Primary actor: Admin
- Goal: Upload images (team logos, player avatars, news thumbnails).
- Preconditions: Admin authenticated; storage configured (local or S3)
- Main success scenario:
  1. Admin uploads via `POST /api/upload` with `type` (teams/players/news/etc).
  2. System validates file type/size.
  3. System stores media and returns a URL.

**UC-06: Admin publishes news**
- Primary actor: Admin
- Goal: Create and publish news articles.
- Preconditions: Admin authenticated
- Main success scenario:
  1. Admin sends `POST /api/news` with `published=true`.
  2. System persists article in DB.
  3. Visitors can read it from `GET /api/news?published=true`.

### Student 3 — Auth/Integrations, DevOps & Testing (3+)

**UC-07: Register and login with email/password**
- Primary actor: Visitor
- Goal: Create an account and sign in without social login.
- Preconditions: None
- Main success scenario:
  1. Actor opens `/login` and uses the Register tab.
  2. System validates, hashes password, and creates user.
  3. Actor logs in later with email/password.

**UC-08: Sign in with Google**
- Primary actor: Visitor
- Goal: Sign in using Google account.
- Preconditions: Google OAuth configured; actor is a Test User during testing phase
- Main success scenario:
  1. Actor clicks “Continue with Google”.
  2. Browser navigates to `GET /api/auth/google`.
  3. Google redirects to `/api/auth/google/callback`.
  4. System creates/updates the user record and establishes a session.

**UC-09: Email notification on registration / events**
- Primary actor: System (triggered by user actions)
- Goal: Send an email when registration occurs (and optionally on match events).
- Preconditions: SMTP configured via env vars
- Main success scenario:
  1. A user registers (email/password) → system sends welcome email.
  2. (Optional) Admin creates a match event and `NOTIFY_EMAILS` is set → system sends notification email.

### Additional use cases (optional, recommended)

**UC-10: Favorite a team/player**
- Primary actor: Registered User
- Goal: Save favorites for faster access and personalization.
- Preconditions: Logged in
- Main success scenario:
  1. User favorites a team/player via `POST /api/favorites`.
  2. System stores favorites; profile displays them via `GET /api/favorites`.

**UC-11: Moderator reviews flagged comments**
- Primary actor: Moderator
- Goal: Review and resolve comment flags.
- Preconditions: Moderator logged in
- Main success scenario:
  1. Moderator loads flags from `GET /api/admin/flags` (alias: `/api/admin/flagged-comments`).
  2. Moderator marks a flag reviewed: `PATCH /api/admin/flags/:id`.
  3. Moderator can remove a comment if needed.

**UC-12: User updates settings**
- Primary actor: Registered User
- Goal: Change theme and notification preferences.
- Preconditions: Logged in
- Main success scenario:
  1. User opens `/settings`.
  2. System reads settings `GET /api/settings`.
  3. User updates toggles; system saves `PATCH /api/settings`.

## Features to Demonstrate (Assignment 2: ≥ 4 working features)
Recommended demo set:
- Google login + email/password login/register (`/login`)
- Matches list + match detail with timeline/stats (`/matches`, `/matches/:id`)
- Real-time updates via WebSockets (`/ws`)
- Comments + flagging + moderation endpoints
- Upload endpoint + storage provider (`/api/upload`)
- Email sending on registration/events (when SMTP configured)

## How to Run (Local)
Prereqs: Node.js 20+

1) Install dependencies
- `npm.cmd ci` (Windows PowerShell)

2) Configure env
- Copy `.env.example` → `.env`
- Set at minimum:
  - `SESSION_SECRET=...`
  - `AUTH_MODE=local`
  - `BASE_URL=http://localhost:5000`
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`

3) Start dev server
- `npm.cmd run dev`

4) Open app
- `http://localhost:5000`

## Database Setup (PostgreSQL)
1) Set `DATABASE_URL` in `.env`
2) Run migrations:
- `npm.cmd run db:push`
3) Seed demo data:
- `npm.cmd exec tsx server/seed.ts` (or `npx tsx server/seed.ts`)

## Storage Setup (S3-compatible)
To use a real storage service (recommended for rubric compliance), set:
- `S3_BUCKET=...`
- `AWS_REGION=...`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `S3_BASE_URL=...` (optional CDN/base URL)

Then uploads via `POST /api/upload` will store to S3 and return an absolute URL.

## Email Setup (SMTP)
To enable email sending, set:
- `SMTP_HOST=...`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `SMTP_FROM=...` (optional)

Optional match-event notifications:
- `NOTIFY_EMAILS=admin@example.com,ops@example.com`

## External Data Sources (Plan for “Real” CS2 data)
Potential APIs you can integrate later:
- PandaScore (esports matches/teams/players; free tier with API key)
- FACEIT Data API (community stats, match data)
- Steam Web API (player summaries; CS2/CSGO news via `GetNewsForApp`)

Proposed approach:
- Create a server-side “ingester” job that periodically fetches data from one provider and upserts into the database tables.
- Cache results and respect provider rate limits.

## Notes
- `.env` is ignored by Git (`.gitignore`) so secrets are not committed.
- A PostCSS warning may appear during build/dev; it’s not blocking functionality.
