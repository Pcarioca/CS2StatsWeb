# CS2Stats Design Guidelines

## Design Approach

**Reference-Based Strategy**: Drawing from modern esports platforms (HLTV, Liquipedia), sports tracking sites (ESPN), and clean data-focused apps (Linear) to create a professional, information-rich experience optimized for real-time match tracking and community engagement.

**Core Principles**:
- Data clarity over decoration - information hierarchy is paramount
- Real-time immediacy - live elements feel alive without distraction
- Gaming-appropriate aesthetic - modern, clean, technical precision
- Scan-optimized layouts - users need to process information quickly

---

## Typography System

**Font Stack**: 
- Primary: Inter or Roboto (high legibility for data/stats)
- Display: Space Grotesk or Outfit (match titles, hero headlines)
- Monospace: JetBrains Mono (scores, timers, stats)

**Hierarchy**:
- Page Titles: Display font, text-4xl to text-5xl, font-bold
- Section Headers: Primary font, text-2xl to text-3xl, font-semibold
- Subsections: text-xl, font-medium
- Body/Stats: text-base, font-normal
- Labels/Meta: text-sm, font-medium, uppercase tracking-wide
- Captions/Timestamps: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** (p-2, m-4, gap-8, py-12, px-16)
- Tight spacing: gap-2, p-2 (within stat groups, icon buttons)
- Standard: gap-4, p-4 (cards, form fields)
- Section padding: py-8 to py-16 (desktop), py-6 to py-12 (mobile)
- Generous: gap-12, p-16 (major page sections)

**Grid Patterns**:
- Match cards: grid-cols-1 md:grid-cols-2 xl:grid-cols-3
- Stat tables: Full-width with horizontal scroll on mobile
- Team/Player grids: grid-cols-2 md:grid-cols-4 lg:grid-cols-5
- Max container width: max-w-7xl for main content

---

## Component Library

### Navigation & Header
- Fixed header: Full-width, h-16, with max-w-7xl inner container
- Logo: h-8, left-aligned with home link
- Primary nav: Horizontal links, text-sm font-medium, gap-8
- Search: w-64 expanding to w-96 on focus, right-side placement
- User controls: Avatar (w-8 h-8 rounded-full), notification bell with badge counter
- Mobile: Hamburger icon, slide-in drawer, bottom tab bar (h-16) with 4-5 primary actions

### Match Cards (List/Grid View)
- Card container: Rounded-lg, p-4, border, hover:shadow-lg transition
- Team sections: Two-column split with logos (w-12 h-12), team names text-lg font-semibold
- Center divider: "VS" or score display, monospace font text-2xl
- Status badge: Top-right absolute, px-3 py-1 rounded-full text-xs font-bold uppercase
- Live indicator: Pulse animation on badge, small dot with ping effect
- Meta row: Tournament name, map icons (w-5 h-5), timestamp - text-sm
- Actions: Star favorite (icon-only), reminder, external stream link icons in top-right

### Live Match Detail Page
**Scoreboard Section**:
- Team blocks: Two-column layout, each with logo (w-20 h-20), name text-3xl, map score (monospace text-5xl)
- Map indicator: Center strip showing current map name, round score, timer (monospace)
- Stream links: Horizontal pill buttons below scoreboard, gap-2

**Event Timeline**:
- Vertical feed, max-h-screen overflow-y-auto
- Event items: Flex row, gap-3, p-3, border-b
- Timestamp: text-xs monospace, w-16 flex-shrink-0
- Event icon: w-6 h-6, flex-shrink-0
- Description: text-sm, player names font-semibold with hover underline
- Recent events: Fade-in animation, bg highlight for 2s on new arrival

**Player Stats Grid**:
- Tabbed interface for teams
- Table: Full-width, text-sm, monospace for numbers
- Headers: text-xs uppercase font-semibold, sticky top-0
- Player rows: Hover bg, clickable, avatar (w-8 h-8), name, then stat columns
- Highlight top performer: Subtle badge or indicator

### Team/Player Pages
**Page Header**:
- Hero banner: Full-width, h-48 to h-64, with gradient overlay
- Profile section: -mt-16 relative positioning, centered or left-aligned
- Avatar/Logo: w-32 h-32, border-4, rounded-full (players) or rounded-lg (teams)
- Name: text-4xl font-bold, country flag inline (w-8)
- Meta: Region, rank, role badges - horizontal pill layout, gap-2
- Follow button: Large, px-6 py-3, rounded-lg, font-semibold

**Content Sections**:
- Tab navigation: Horizontal, sticky below header, border-b
- Section padding: py-12, max-w-6xl mx-auto
- Stat cards: Grid layout, p-6, rounded-lg, border
- Match history: Table or list, alternating rows, w-full

### Comments & Community
**Thread Container**:
- Nested indent: pl-8 border-l-2 for replies (max 3 levels)
- Comment item: p-4, gap-3, flex layout
- Avatar: w-10 h-10 rounded-full
- Header: Username font-semibold, timestamp text-xs, badges inline
- Body: text-base, max-w-prose
- Actions: Icon buttons (reply, like, report), text-sm, gap-4, mt-2
- Composer: Textarea, min-h-24, p-3, rounded-lg, border-2 on focus

### Search & Filters
**Global Search Dropdown**:
- Absolute positioned, top-full mt-2, w-96 max-h-96 overflow-y-auto
- Grouped results: Category headers text-xs uppercase mb-2
- Result items: p-3 hover:bg, gap-3 flex, avatar/logo w-8 h-8, name font-medium, meta text-sm

**Filter Panel** (matches/players):
- Sidebar or horizontal chips layout
- Chips: px-3 py-1.5 rounded-full text-sm, selectable toggle state
- Dropdowns: Full-width on mobile, min-w-48 on desktop

### Notifications
- Bell icon with badge: Absolute positioned counter, -top-1 -right-1, w-5 h-5 rounded-full
- Dropdown panel: Absolute right-0, w-80 md:w-96, max-h-96 overflow-y-auto, rounded-lg shadow-xl
- Item: p-4 border-b, unread indicator (dot w-2 h-2), timestamp text-xs, action text

---

## Page-Specific Layouts

### Home/Dashboard
1. **Hero Section** (if live match): Full-width, py-16, featured match card with large scoreboard
2. **Quick Filters**: Sticky tab bar, py-4
3. **Match Grid**: 3-column on desktop, responsive collapse, gap-4
4. **Favorites Feed** (logged in): Two-column layout - upcoming matches left, news/activity right
5. **News Highlights**: Card grid, image thumbnails (aspect-video), gap-6

### Match Detail
- Single-column primary content (timeline, stats) max-w-4xl
- Optional right sidebar (w-80) for live chat/community on xl screens
- Sticky scoreboard at top on scroll

### News Article
- Hero image: Full-width, aspect-video or aspect-[21/9]
- Content: max-w-3xl mx-auto, prose styling, py-12
- Related matches/stats: Inline cards, p-4, rounded-lg
- Comments: Below article, full-width

---

## Images

**Hero Images**:
- Home page: If live match exists, use action shot from tournament (1920x800)
- Team pages: Team banner/photo (1920x400) with gradient overlay
- Player pages: Action portrait (1920x400)
- News articles: Featured image (1920x1080, cropped to aspect-video)

**Contextual Images**:
- Team logos: Square, 128x128 minimum, used at various sizes
- Player avatars: Square or portraits, 256x256
- Map thumbnails: 16:9, 400x225
- Gallery uploads: Responsive, maintain aspect ratios

**Image Buttons**: When buttons overlay images (hero sections), use backdrop-blur-md with semi-transparent backgrounds for readability.

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Base (< 640px) - single column, bottom tabs, collapsible filters
- Tablet: md (768px+) - two columns where appropriate, condensed header
- Desktop: lg (1024px+) - full multi-column, sidebar layouts
- Wide: xl (1280px+) - max-w-7xl containers, optional third columns

**Key Adaptations**:
- Stats tables: Horizontal scroll on mobile with sticky first column
- Match cards: Stack team info vertically on mobile
- Navigation: Hamburger menu + bottom tabs on mobile
- Sidebars: Convert to tabs or accordion sections on mobile

---

## Accessibility & Polish

- All interactive elements: Focus rings (ring-2 ring-offset-2)
- Icon-only buttons: Always include sr-only labels
- Live regions: ARIA-live="polite" for match updates
- Keyboard navigation: Full tab order, escape to close modals
- Reduced motion: Respect prefers-reduced-motion for animations
- Link clarity: Underline on hover or visited state differentiation