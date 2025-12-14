import {
  users,
  teams,
  players,
  matches,
  matchEvents,
  matchPlayerStats,
  newsArticles,
  comments,
  commentFlags,
  userFavorites,
  notifications,
  userSettings,
  type User,
  type UpsertUser,
  type Team,
  type InsertTeam,
  type Player,
  type InsertPlayer,
  type Match,
  type MatchWithTeams,
  type InsertMatch,
  type MatchEvent,
  type InsertMatchEvent,
  type MatchPlayerStats,
  type InsertMatchPlayerStats,
  type NewsArticle,
  type InsertNewsArticle,
  type Comment,
  type InsertComment,
  type CommentFlag,
  type InsertCommentFlag,
  type UserFavorite,
  type InsertUserFavorite,
  type Notification,
  type InsertNotification,
  type UserSettings,
  type InsertUserSettings,
} from "@shared/schema";
import { db as database, hasDatabase } from "./db";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { MemoryStorage } from "./memoryStorage";

// `db` is only used when DATABASE_URL is set. When it's not set we use MemoryStorage instead.
// The non-null assertion keeps TypeScript happy without eagerly throwing at import-time.
const db = database!;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  getTeams(limit?: number, offset?: number): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  getPlayers(teamId?: string, limit?: number, offset?: number): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;

  getMatches(status?: string, limit?: number, offset?: number): Promise<MatchWithTeams[]>;
  getMatch(id: string): Promise<MatchWithTeams | undefined>;
  createMatch(match: InsertMatch): Promise<MatchWithTeams>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;

  getMatchEvents(matchId: string, limit?: number): Promise<MatchEvent[]>;
  createMatchEvent(event: InsertMatchEvent): Promise<MatchEvent>;

  getMatchPlayerStats(matchId: string): Promise<MatchPlayerStats[]>;
  createMatchPlayerStats(stats: InsertMatchPlayerStats): Promise<MatchPlayerStats>;
  updateMatchPlayerStats(id: string, stats: Partial<InsertMatchPlayerStats>): Promise<MatchPlayerStats | undefined>;

  getNewsArticles(published?: boolean, limit?: number, offset?: number): Promise<NewsArticle[]>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: string): Promise<boolean>;

  getComments(matchId?: string, articleId?: string, parentCommentId?: string | null): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;

  getCommentFlags(reviewed?: boolean): Promise<CommentFlag[]>;
  createCommentFlag(flag: InsertCommentFlag): Promise<CommentFlag>;
  updateCommentFlag(id: string, reviewed: boolean): Promise<CommentFlag | undefined>;

  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  createUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  deleteUserFavorite(id: string): Promise<boolean>;

  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;

  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;

  getLeaderboard(limit?: number): Promise<Player[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // `id` is optional on insert (DB default), but required for lookups/updates.
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          passwordHash: userData.passwordHash,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getTeams(limit: number = 50, offset: number = 0): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .orderBy(desc(teams.rank))
      .limit(limit)
      .offset(offset);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(teamData).returning();
    return team;
  }

  async updateTeam(id: string, teamData: Partial<InsertTeam>): Promise<Team | undefined> {
    const [team] = await db
      .update(teams)
      .set({ ...teamData, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id)).returning();
    return result.length > 0;
  }

  async getPlayers(teamId?: string, limit: number = 50, offset: number = 0): Promise<Player[]> {
    if (teamId) {
      return await db
        .select()
        .from(players)
        .where(eq(players.teamId, teamId))
        .limit(limit)
        .offset(offset);
    }
    return await db.select().from(players).limit(limit).offset(offset);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async createPlayer(playerData: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(playerData).returning();
    return player;
  }

  async updatePlayer(id: string, playerData: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set({ ...playerData, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return player;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id)).returning();
    return result.length > 0;
  }

  async getMatches(status?: string, limit: number = 20, offset: number = 0): Promise<MatchWithTeams[]> {
    const query = db
      .select({
        id: matches.id,
        team1Id: matches.team1Id,
        team2Id: matches.team2Id,
        status: matches.status,
        tournament: matches.tournament,
        stage: matches.stage,
        scheduledAt: matches.scheduledAt,
        startedAt: matches.startedAt,
        finishedAt: matches.finishedAt,
        team1Score: matches.team1Score,
        team2Score: matches.team2Score,
        currentMap: matches.currentMap,
        maps: matches.maps,
        streamLinks: matches.streamLinks,
        createdAt: matches.createdAt,
        updatedAt: matches.updatedAt,
        team1: teams,
        team2: sql<Team>`NULL`.as('team2'),
      })
      .from(matches)
      .leftJoin(teams, eq(matches.team1Id, teams.id));

    if (status) {
      query.where(eq(matches.status, status as any));
    }

    const results = await query
      .orderBy(desc(matches.scheduledAt))
      .limit(limit)
      .offset(offset);

    const matchesWithTeams: MatchWithTeams[] = [];
    for (const result of results) {
      const [team2] = await db.select().from(teams).where(eq(teams.id, result.team2Id));
      matchesWithTeams.push({
        id: result.id,
        team1Id: result.team1Id,
        team2Id: result.team2Id,
        status: result.status,
        tournament: result.tournament,
        stage: result.stage,
        scheduledAt: result.scheduledAt,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        currentMap: result.currentMap,
        maps: result.maps,
        streamLinks: result.streamLinks,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        team1: result.team1!,
        team2: team2,
      });
    }

    return matchesWithTeams;
  }

  async getMatch(id: string): Promise<MatchWithTeams | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    if (!match) return undefined;

    const [team1] = await db.select().from(teams).where(eq(teams.id, match.team1Id));
    const [team2] = await db.select().from(teams).where(eq(teams.id, match.team2Id));

    return {
      ...match,
      team1,
      team2,
    };
  }

  async createMatch(matchData: InsertMatch): Promise<MatchWithTeams> {
    const [match] = await db.insert(matches).values(matchData).returning();
    
    const [team1] = await db.select().from(teams).where(eq(teams.id, match.team1Id));
    const [team2] = await db.select().from(teams).where(eq(teams.id, match.team2Id));
    
    return {
      ...match,
      team1,
      team2,
    };
  }

  async updateMatch(id: string, matchData: Partial<InsertMatch>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set({ ...matchData, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const result = await db.delete(matches).where(eq(matches.id, id)).returning();
    return result.length > 0;
  }

  async getMatchEvents(matchId: string, limit: number = 100): Promise<MatchEvent[]> {
    return await db
      .select()
      .from(matchEvents)
      .where(eq(matchEvents.matchId, matchId))
      .orderBy(desc(matchEvents.timestamp))
      .limit(limit);
  }

  async createMatchEvent(eventData: InsertMatchEvent): Promise<MatchEvent> {
    const [event] = await db.insert(matchEvents).values(eventData).returning();
    return event;
  }

  async getMatchPlayerStats(matchId: string): Promise<MatchPlayerStats[]> {
    return await db
      .select()
      .from(matchPlayerStats)
      .where(eq(matchPlayerStats.matchId, matchId));
  }

  async createMatchPlayerStats(statsData: InsertMatchPlayerStats): Promise<MatchPlayerStats> {
    const [stats] = await db.insert(matchPlayerStats).values(statsData).returning();
    return stats;
  }

  async updateMatchPlayerStats(id: string, statsData: Partial<InsertMatchPlayerStats>): Promise<MatchPlayerStats | undefined> {
    const [stats] = await db
      .update(matchPlayerStats)
      .set({ ...statsData, updatedAt: new Date() })
      .where(eq(matchPlayerStats.id, id))
      .returning();
    return stats;
  }

  async getNewsArticles(published?: boolean, limit: number = 20, offset: number = 0): Promise<NewsArticle[]> {
    const whereClause =
      published === undefined ? undefined : eq(newsArticles.published, published);

    const query = whereClause
      ? db.select().from(newsArticles).where(whereClause)
      : db.select().from(newsArticles);

    return await query
      .orderBy(desc(newsArticles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async createNewsArticle(articleData: InsertNewsArticle): Promise<NewsArticle> {
    const [article] = await db.insert(newsArticles).values(articleData).returning();
    return article;
  }

  async updateNewsArticle(id: string, articleData: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const [article] = await db
      .update(newsArticles)
      .set({ ...articleData, updatedAt: new Date() })
      .where(eq(newsArticles.id, id))
      .returning();
    return article;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    const result = await db.delete(newsArticles).where(eq(newsArticles.id, id)).returning();
    return result.length > 0;
  }

  async getComments(matchId?: string, articleId?: string, parentCommentId?: string | null): Promise<Comment[]> {
    const conditions: any[] = [eq(comments.removed, false)];

    if (matchId) conditions.push(eq(comments.matchId, matchId));
    if (articleId) conditions.push(eq(comments.articleId, articleId));
    if (parentCommentId !== undefined) {
      conditions.push(
        parentCommentId === null
          ? sql`${comments.parentCommentId} IS NULL`
          : eq(comments.parentCommentId, parentCommentId),
      );
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    return await db.select().from(comments).where(whereClause).orderBy(desc(comments.createdAt));
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async updateComment(id: string, commentData: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ ...commentData, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async getCommentFlags(reviewed?: boolean): Promise<CommentFlag[]> {
    const whereClause =
      reviewed === undefined ? undefined : eq(commentFlags.reviewed, reviewed);

    const query = whereClause
      ? db.select().from(commentFlags).where(whereClause)
      : db.select().from(commentFlags);

    return await query.orderBy(desc(commentFlags.createdAt));
  }

  async createCommentFlag(flagData: InsertCommentFlag): Promise<CommentFlag> {
    const [flag] = await db.insert(commentFlags).values(flagData).returning();
    
    await db
      .update(comments)
      .set({ flagged: true })
      .where(eq(comments.id, flagData.commentId));

    return flag;
  }

  async updateCommentFlag(id: string, reviewed: boolean): Promise<CommentFlag | undefined> {
    const [flag] = await db
      .update(commentFlags)
      .set({ reviewed })
      .where(eq(commentFlags.id, id))
      .returning();
    return flag;
  }

  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
  }

  async createUserFavorite(favoriteData: InsertUserFavorite): Promise<UserFavorite> {
    const [favorite] = await db.insert(userFavorites).values(favoriteData).returning();
    return favorite;
  }

  async deleteUserFavorite(id: string): Promise<boolean> {
    const result = await db.delete(userFavorites).where(eq(userFavorites.id, id)).returning();
    return result.length > 0;
  }

  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const conditions: any[] = [eq(notifications.userId, userId)];
    if (unreadOnly) conditions.push(eq(notifications.read, false));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    return await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(settingsData: InsertUserSettings): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values(settingsData)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  async getLeaderboard(limit: number = 50): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .orderBy(desc(players.averageRating), desc(players.totalKills))
      .limit(limit);
  }
}

export const storage: IStorage = hasDatabase ? new DbStorage() : new MemoryStorage();
