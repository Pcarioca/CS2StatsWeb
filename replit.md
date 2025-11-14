# CS2Stats - Real-time Counter-Strike 2 Match Tracker

## Project Overview
CS2Stats is a comprehensive web platform for tracking live CS2 matches, viewing team and player statistics, engaging with the community, and managing personalized notifications for favorite teams and players.

## Current Status: Phase 1 (Schema & Frontend) - IN PROGRESS

### Completed Components

#### Core Infrastructure
- ✅ Complete database schema with all entities (users, teams, players, matches, events, comments, notifications, etc.)
- ✅ Theme system with light/dark/system modes
- ✅ Replit Auth integration setup (hooks and utilities)
- ✅ Responsive header with navigation and search
- ✅ Footer with links
- ✅ Design tokens configured in index.css

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

### Next Steps (Task 2: Backend)
- Implement all API routes
- Set up WebSocket server for real-time updates
- Create database storage layer
- Implement Replit Auth server-side
- Push database schema with Drizzle
- Seed initial data for testing

### Next Steps (Task 3: Integration & Testing)
- Connect frontend to backend APIs
- Implement WebSocket live updates
- Add error handling and loading states
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
- 2024-01-14: Initial project setup with complete frontend implementation
- Created all page components and navigation structure
- Configured theme system and design tokens
- Set up comprehensive database schema
