# CS2Stats - Real-time Counter-Strike 2 Match Tracker

## Project Overview
CS2Stats is a comprehensive web platform for tracking live CS2 matches, viewing team and player statistics, engaging with the community, and managing personalized notifications for favorite teams and players.

## Current Status: Phase 2 (Backend Implementation) - COMPLETED

### Completed Components

#### Core Infrastructure
- ✅ Complete database schema with all entities (users, teams, players, matches, events, comments, notifications, etc.)
- ✅ PostgreSQL database provisioned and migrations synced
- ✅ Theme system with light/dark/system modes
- ✅ Replit Auth integration setup (hooks and utilities + server middleware)
- ✅ Responsive header with navigation and search
- ✅ Footer with links
- ✅ Design tokens configured in index.css
- ✅ Complete backend API with all routes
- ✅ WebSocket server for real-time updates
- ✅ Image upload endpoint with validation

#### Pages Implemented
1. **Landing Page** - Hero section with features showcase for non-authenticated users
2. **Home Dashboard** - Live/upcoming/finished matches with tabs, personalized for authenticated users
3. **Matches Page** - Filterable match listing with search
4. **Match Detail Page** - Live scoreboard, timeline, player stats, and comments tabs
5. **Teams Page** - Grid of all teams with search
6. **Players Page** - Grid of all players with stats preview
7. **Leaderboards Page** - Ranked player stats with filters
8. **News Page** - Article feed with thumbnails
9. **Profile Page** - User profile with favorites
10. **Settings Page** - Theme, notifications, privacy settings
11. **Admin Dashboard** - Match management, moderation, content management

#### Components Created
- Header with navigation, search, notifications, theme toggle
- Footer with links
- ThemeToggle component
- ThemeProvider context
- MatchCard components
- Authentication hooks (useAuth)
- Auth utilities (isUnauthorizedError)

### Database Schema Entities
- Users (with Replit Auth support)
- Teams (with stats, logos, social links)
- Players (with career stats, team assignments)
- Matches (with status, scores, streams)
- Match Events (timeline events)
- Match Player Stats (per-match performance)
- News Articles
- Comments (threaded, with moderation)
- Comment Flags (abuse reports)
- User Favorites
- Notifications
- User Settings
- Sessions (for auth)

### Backend Implementation (COMPLETED)

#### Authentication & Authorization
- ✅ Replit Auth (OpenID Connect) with PostgreSQL session store
- ✅ Auth middleware: isAuthenticated, isAdmin, isModerator
- ✅ Role-based access control (user/moderator/admin)
- ✅ Auth routes: GET /api/auth/user, GET /api/login, GET /api/logout, GET /api/callback

#### Storage Layer (DbStorage)
- ✅ Complete IStorage interface with all domain operations
- ✅ DbStorage class implementing all CRUD operations with Drizzle ORM
- ✅ Users: getUser, upsertUser
- ✅ Teams: getTeams, getTeam, createTeam, updateTeam, deleteTeam
- ✅ Players: getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer
- ✅ Matches: getMatches (with status filter), getMatch, createMatch, updateMatch, deleteMatch
- ✅ Match Events: getMatchEvents, createMatchEvent
- ✅ Match Stats: getMatchPlayerStats, createMatchPlayerStats, updateMatchPlayerStats
- ✅ News: getNewsArticles (with published filter), getNewsArticle, createNewsArticle, updateNewsArticle, deleteNewsArticle
- ✅ Comments: getComments (with filters), getComment, createComment, updateComment, deleteComment
- ✅ Comment Flags: getCommentFlags, createCommentFlag, updateCommentFlag
- ✅ Favorites: getUserFavorites, createUserFavorite, deleteUserFavorite
- ✅ Notifications: getNotifications (with unread filter), createNotification, markNotificationAsRead
- ✅ Settings: getUserSettings, upsertUserSettings
- ✅ Leaderboards: getLeaderboard (aggregated player stats)

#### API Routes (server/routes.ts)
- ✅ Auth: GET /api/auth/user (returns current user)
- ✅ Teams: GET /api/teams, GET /api/teams/:id, POST /api/teams (admin), PATCH /api/teams/:id (admin), DELETE /api/teams/:id (admin)
- ✅ Players: GET /api/players, GET /api/players/:id, POST /api/players (admin), PATCH /api/players/:id (admin), DELETE /api/players/:id (admin)
- ✅ Matches: GET /api/matches (with status filter), GET /api/matches/:id, POST /api/matches (admin), PATCH /api/matches/:id (admin), DELETE /api/matches/:id (admin)
- ✅ Match Events: GET /api/matches/:id/events, POST /api/matches/:id/events (admin with WebSocket broadcast)
- ✅ Match Stats: GET /api/matches/:id/stats, POST /api/matches/:id/stats (admin)
- ✅ News: GET /api/news (with published filter), GET /api/news/:id, POST /api/news (admin), PATCH /api/news/:id (admin), DELETE /api/news/:id (admin)
- ✅ Comments: GET /api/comments, POST /api/comments (authenticated), PATCH /api/comments/:id (author only), DELETE /api/comments/:id (author/moderator/admin), POST /api/comments/:id/flag (authenticated)
- ✅ Favorites: GET /api/favorites (authenticated), POST /api/favorites (authenticated), DELETE /api/favorites/:id (authenticated)
- ✅ Notifications: GET /api/notifications (authenticated, with unread filter), PATCH /api/notifications/:id/read (authenticated)
- ✅ Settings: GET /api/settings (authenticated), PATCH /api/settings (authenticated)
- ✅ Leaderboards: GET /api/leaderboards
- ✅ Admin: GET /api/admin/flags (moderator), PATCH /api/admin/flags/:id (moderator), PATCH /api/admin/comments/:id (moderator), DELETE /api/admin/comments/:id (moderator)
- ✅ Upload: POST /api/upload (authenticated, image validation, 5MB limit)

#### Real-time Features
- ✅ WebSocket server on /ws path
- ✅ Match update broadcasting (on PATCH /api/matches/:id)
- ✅ Match event broadcasting (on POST /api/matches/:id/events)
- ✅ Connection handling with welcome message

#### Request Validation
- ✅ Zod schemas from shared/schema.ts (insertXSchema)
- ✅ Proper error handling with HTTP status codes
- ✅ Pagination support (limit/offset) for list endpoints

#### File Upload
- ✅ Multer configuration with disk storage
- ✅ Image type validation (jpeg, jpg, png, gif, webp)
- ✅ File size limit (5MB)
- ✅ Organized uploads directory structure (teams, players, matches, news)

### Next Steps (Task 3: Integration & Testing)
- Connect frontend to backend APIs
- Implement WebSocket live updates in frontend
- Add error handling and loading states
- Seed initial test data
- Test all user journeys
- Get architect feedback
- Deploy and polish

## Technology Stack
- **Frontend**: React, Wouter (routing), TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, WebSocket (ws), Replit Auth (OpenID Connect)
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Real-time**: WebSocket for live match updates
- **Authentication**: Replit Auth with session storage

## Design Principles
- Information density for esports data
- Real-time immediacy without distraction
- Clean, modern aesthetic
- Responsive mobile-first design
- Accessibility (WCAG AA compliance)
- Dark mode support

## User Roles
- **Visitor**: Browse matches, teams, players, news
- **Registered User**: + Favorites, comments, notifications, profile
- **Admin**: + Content management, moderation, match creation

## Recent Changes
- 2025-11-14: **Backend Implementation Complete**
  - Implemented complete backend with all API routes
  - Set up Replit Auth with PostgreSQL session store
  - Created DbStorage class with Drizzle ORM
  - Implemented WebSocket server for real-time updates
  - Added image upload endpoint with validation
  - Configured role-based access control (user/moderator/admin)
  - Deployed all CRUD operations for teams, players, matches, news, comments
  - Added pagination and filtering support
  - Server running successfully on port 5000
- 2024-01-14: Initial project setup with complete frontend implementation
  - Created all page components and navigation structure
  - Configured theme system and design tokens
  - Set up comprehensive database schema
