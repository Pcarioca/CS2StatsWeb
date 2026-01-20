import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const matchStatusEnum = pgEnum("match_status", ["live", "upcoming", "finished"]);
export const matchEventTypeEnum = pgEnum("match_event_type", [
  "kill",
  "round_end",
  "bomb_plant",
  "bomb_defuse",
  "clutch",
  "ace",
  "player_injury",
  "roster_change"
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "match_start",
  "favorite_team_match",
  "favorite_player_match",
  "comment_reply",
  "mention",
  "admin_announcement"
]);
export const commentFlagReasonEnum = pgEnum("comment_flag_reason", [
  "spam",
  "hate",
  "harassment",
  "inappropriate",
  "other"
]);
export const userRoleEnum = pgEnum("user_role", ["user", "moderator", "admin"]);

// ============================================================================
// SESSION & USER TABLES (Required for Replit Auth)
// ============================================================================

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// PASSWORD RESET TOKENS
// ============================================================================

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ============================================================================
// TEAMS
// ============================================================================

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  acronym: varchar("acronym", { length: 10 }),
  country: varchar("country", { length: 3 }), // ISO country code
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  region: text("region"),
  rank: integer("rank"),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  socialLinks: jsonb("social_links").$type<{ twitter?: string; twitch?: string; youtube?: string }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams, {
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      twitch: z.string().optional(),
      youtube: z.string().optional(),
    })
    .nullable()
    .optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// ============================================================================
// PLAYERS
// ============================================================================

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "set null" }),
  alias: text("alias").notNull(),
  realName: text("real_name"),
  country: varchar("country", { length: 3 }),
  avatarUrl: text("avatar_url"),
  role: text("role"), // e.g., "AWPer", "Entry Fragger", "IGL"
  steamId: text("steam_id"),
  totalMatches: integer("total_matches").default(0).notNull(),
  totalKills: integer("total_kills").default(0).notNull(),
  totalDeaths: integer("total_deaths").default(0).notNull(),
  totalAssists: integer("total_assists").default(0).notNull(),
  averageRating: integer("average_rating").default(0).notNull(), // stored as integer (multiply by 100)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// ============================================================================
// MATCHES
// ============================================================================

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  team1Id: varchar("team1_id").references(() => teams.id).notNull(),
  team2Id: varchar("team2_id").references(() => teams.id).notNull(),
  status: matchStatusEnum("status").default("upcoming").notNull(),
  tournament: text("tournament"),
  stage: text("stage"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  team1Score: integer("team1_score").default(0).notNull(),
  team2Score: integer("team2_score").default(0).notNull(),
  currentMap: text("current_map"),
  maps: jsonb("maps").$type<string[]>(),
  streamLinks: jsonb("stream_links").$type<{ platform: string; url: string; latency?: string }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches, {
  maps: z.array(z.string()).nullable().optional(),
  streamLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string(),
        latency: z.string().optional(),
      }),
    )
    .nullable()
    .optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type MatchWithTeams = Match & {
  team1: Team;
  team2: Team;
};

// ============================================================================
// MATCH EVENTS (for live timeline)
// ============================================================================

export const matchEvents = pgTable("match_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  eventType: matchEventTypeEnum("event_type").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  description: text("description").notNull(),
  playerId: varchar("player_id").references(() => players.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<{
    weapon?: string;
    round?: number;
    side?: string;
    victim?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchEventSchema = createInsertSchema(matchEvents, {
  metadata: z
    .object({
      weapon: z.string().optional(),
      round: z.number().int().optional(),
      side: z.string().optional(),
      victim: z.string().optional(),
    })
    .nullable()
    .optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;
export type MatchEvent = typeof matchEvents.$inferSelect;

// ============================================================================
// MATCH PLAYER STATS
// ============================================================================

export const matchPlayerStats = pgTable("match_player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
  playerId: varchar("player_id").references(() => players.id, { onDelete: "cascade" }).notNull(),
  kills: integer("kills").default(0).notNull(),
  deaths: integer("deaths").default(0).notNull(),
  assists: integer("assists").default(0).notNull(),
  adr: integer("adr").default(0).notNull(), // Average Damage per Round
  headshotPercent: integer("headshot_percent").default(0).notNull(),
  rating: integer("rating").default(0).notNull(), // stored as integer (multiply by 100)
  openingKills: integer("opening_kills").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMatchPlayerStatsSchema = createInsertSchema(matchPlayerStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMatchPlayerStats = z.infer<typeof insertMatchPlayerStatsSchema>;
export type MatchPlayerStats = typeof matchPlayerStats.$inferSelect;

// ============================================================================
// NEWS ARTICLES
// ============================================================================

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  heroImageUrl: text("hero_image_url"),
  tags: jsonb("tags").$type<string[]>(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles, {
  tags: z.array(z.string()).nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

// ============================================================================
// COMMENTS
// ============================================================================

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  matchId: varchar("match_id").references(() => matches.id, { onDelete: "cascade" }),
  articleId: varchar("article_id").references(() => newsArticles.id, { onDelete: "cascade" }),
  parentCommentId: varchar("parent_comment_id").references((): any => comments.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  flagged: boolean("flagged").default(false).notNull(),
  removed: boolean("removed").default(false).notNull(),
  removalReason: text("removal_reason"),
  removedBy: varchar("removed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  flagged: true,
  removed: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// ============================================================================
// COMMENT FLAGS (Abuse Reports)
// ============================================================================

export const commentFlags = pgTable("comment_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reason: commentFlagReasonEnum("reason").notNull(),
  additionalInfo: text("additional_info"),
  reviewed: boolean("reviewed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentFlagSchema = createInsertSchema(commentFlags).omit({
  id: true,
  createdAt: true,
});

export type InsertCommentFlag = z.infer<typeof insertCommentFlagSchema>;
export type CommentFlag = typeof commentFlags.$inferSelect;

// ============================================================================
// USER FAVORITES
// ============================================================================

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").references(() => players.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ============================================================================
// USER SETTINGS
// ============================================================================

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  theme: text("theme").default("system").notNull(), // "light", "dark", "system"
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  matchStartAlerts: boolean("match_start_alerts").default(true).notNull(),
  commentReplyAlerts: boolean("comment_reply_alerts").default(true).notNull(),
  newsletter: boolean("newsletter").default(false).notNull(),
  publicProfile: boolean("public_profile").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// ============================================================================
// RELATIONS
// ============================================================================

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  homeMatches: many(matches, { relationName: "team1Matches" }),
  awayMatches: many(matches, { relationName: "team2Matches" }),
  favorites: many(userFavorites),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  matchStats: many(matchPlayerStats),
  events: many(matchEvents),
  favorites: many(userFavorites),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  team1: one(teams, {
    fields: [matches.team1Id],
    references: [teams.id],
    relationName: "team1Matches",
  }),
  team2: one(teams, {
    fields: [matches.team2Id],
    references: [teams.id],
    relationName: "team2Matches",
  }),
  events: many(matchEvents),
  playerStats: many(matchPlayerStats),
  comments: many(comments),
}));

export const matchPlayerStatsRelations = relations(matchPlayerStats, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayerStats.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [matchPlayerStats.playerId],
    references: [players.id],
  }),
}));

export const commentFlagsRelations = relations(commentFlags, ({ one }) => ({
  comment: one(comments, {
    fields: [commentFlags.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentFlags.userId],
    references: [users.id],
  }),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, {
    fields: [matchEvents.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [matchEvents.playerId],
    references: [players.id],
  }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  articles: many(newsArticles),
  comments: many(comments),
  favorites: many(userFavorites),
  notifications: many(notifications),
  settings: one(userSettings),
  flaggedComments: many(commentFlags),
  passwordResetTokens: many(passwordResetTokens),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  match: one(matches, {
    fields: [comments.matchId],
    references: [matches.id],
  }),
  article: one(newsArticles, {
    fields: [comments.articleId],
    references: [newsArticles.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, { relationName: "commentReplies" }),
  flags: many(commentFlags),
}));

export const newsArticlesRelations = relations(newsArticles, ({ one, many }) => ({
  author: one(users, {
    fields: [newsArticles.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [userFavorites.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [userFavorites.playerId],
    references: [players.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
