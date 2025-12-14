import crypto from "crypto";
import type {
  User,
  UpsertUser,
  Team,
  InsertTeam,
  Player,
  InsertPlayer,
  Match,
  MatchWithTeams,
  InsertMatch,
  MatchEvent,
  InsertMatchEvent,
  MatchPlayerStats,
  InsertMatchPlayerStats,
  NewsArticle,
  InsertNewsArticle,
  Comment,
  InsertComment,
  CommentFlag,
  InsertCommentFlag,
  UserFavorite,
  InsertUserFavorite,
  Notification,
  InsertNotification,
  UserSettings,
  InsertUserSettings,
} from "@shared/schema";
import type { IStorage } from "./storage";

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date();
}

function withTimestamps<T extends Record<string, unknown>>(data: T) {
  const timestamp = now();
  return { ...data, createdAt: timestamp, updatedAt: timestamp } as T & {
    createdAt: Date;
    updatedAt: Date;
  };
}

type EntityMap<T extends { id: string }> = Map<string, T>;

export class MemoryStorage implements IStorage {
  private users: EntityMap<User> = new Map();
  private teams: EntityMap<Team> = new Map();
  private players: EntityMap<Player> = new Map();
  private matches: EntityMap<Match> = new Map();
  private matchEvents: EntityMap<MatchEvent> = new Map();
  private matchPlayerStats: EntityMap<MatchPlayerStats> = new Map();
  private newsArticles: EntityMap<NewsArticle> = new Map();
  private comments: EntityMap<Comment> = new Map();
  private commentFlags: EntityMap<CommentFlag> = new Map();
  private userFavorites: EntityMap<UserFavorite> = new Map();
  private notifications: EntityMap<Notification> = new Map();
  private userSettings: Map<string, UserSettings> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const teamNavi = this.insertTeam({
      name: "Natus Vincere",
      acronym: "NAVI",
      country: "UKR",
      region: "Europe",
      rank: 1,
      wins: 45,
      losses: 12,
      logoUrl: "/uploads/teams/navi-logo.png",
    });

    const teamFaze = this.insertTeam({
      name: "FaZe Clan",
      acronym: "FaZe",
      country: "EUR",
      region: "Europe",
      rank: 2,
      wins: 42,
      losses: 15,
      logoUrl: "/uploads/teams/faze-logo.png",
    });

    const teamVitality = this.insertTeam({
      name: "Team Vitality",
      acronym: "VIT",
      country: "FRA",
      region: "Europe",
      rank: 3,
      wins: 38,
      losses: 18,
      logoUrl: "/uploads/teams/vitality-logo.png",
    });

    const playerS1mple = this.insertPlayer({
      teamId: teamNavi.id,
      alias: "s1mple",
      realName: "Oleksandr Kostyliev",
      country: "UKR",
      role: "AWPer",
      totalMatches: 150,
      totalKills: 18500,
      totalDeaths: 12000,
      totalAssists: 3500,
      averageRating: 132,
      avatarUrl: "/uploads/players/s1mple.png",
    });

    this.insertPlayer({
      teamId: teamFaze.id,
      alias: "karrigan",
      realName: "Finn Andersen",
      country: "DNK",
      role: "IGL",
      totalMatches: 200,
      totalKills: 15000,
      totalDeaths: 14000,
      totalAssists: 4000,
      averageRating: 110,
      avatarUrl: "/uploads/players/karrigan.png",
    });

    this.insertPlayer({
      teamId: teamVitality.id,
      alias: "ZywOo",
      realName: "Mathieu Herbaut",
      country: "FRA",
      role: "AWPer",
      totalMatches: 180,
      totalKills: 19000,
      totalDeaths: 13000,
      totalAssists: 4200,
      averageRating: 138,
      avatarUrl: "/uploads/players/zywoo.png",
    });

    const liveMatch = this.insertMatch({
      team1Id: teamNavi.id,
      team2Id: teamFaze.id,
      status: "live",
      tournament: "IEM Example",
      stage: "Group Stage",
      scheduledAt: new Date(Date.now() - 10 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
      team1Score: 8,
      team2Score: 6,
      currentMap: "Mirage",
      maps: ["Mirage", "Inferno", "Nuke"],
      streamLinks: [
        { platform: "Twitch", url: "https://twitch.tv/esl_csgo", latency: "Low" },
      ],
    });

    this.insertMatchEvent({
      matchId: liveMatch.id,
      eventType: "kill",
      timestamp: new Date(Date.now() - 60 * 1000),
      description: "s1mple got a crucial AWP pick",
      playerId: playerS1mple.id,
      metadata: { weapon: "AWP", round: 15, side: "T" },
    });

    this.insertNewsArticle({
      title: "Welcome to CS2Stats",
      subtitle: "Local dev mode is running without a database.",
      content: "This is seeded demo content. Configure DATABASE_URL to use Postgres/Drizzle storage.",
      heroImageUrl: "/uploads/news/navi-wins.jpg",
      published: true,
      authorId: null as any,
    });
  }

  private insertTeam(team: InsertTeam): Team {
    const created = withTimestamps({
      ...team,
      id: uuid(),
    }) as Team;
    this.teams.set(created.id, created);
    return created;
  }

  private insertPlayer(player: InsertPlayer): Player {
    const created = withTimestamps({
      ...player,
      id: uuid(),
    }) as Player;
    this.players.set(created.id, created);
    return created;
  }

  private insertMatch(match: InsertMatch): Match {
    const created = withTimestamps({
      ...match,
      id: uuid(),
    }) as Match;
    this.matches.set(created.id, created);
    return created;
  }

  private insertMatchEvent(event: InsertMatchEvent): MatchEvent {
    const created = {
      ...event,
      id: uuid(),
      createdAt: now(),
      timestamp: event.timestamp ?? now(),
    } as MatchEvent;
    this.matchEvents.set(created.id, created);
    return created;
  }

  private insertNewsArticle(article: InsertNewsArticle): NewsArticle {
    const created = withTimestamps({
      ...article,
      id: uuid(),
    }) as NewsArticle;
    this.newsArticles.set(created.id, created);
    return created;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase();
    return Array.from(this.users.values()).find((u) => (u.email ?? "").toLowerCase() === normalizedEmail);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id ?? uuid();
    const existing = this.users.get(id);
    const timestamp = now();
    const next: User = {
      id,
      email: userData.email ?? existing?.email ?? null,
      firstName: userData.firstName ?? existing?.firstName ?? null,
      lastName: userData.lastName ?? existing?.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? existing?.profileImageUrl ?? null,
      passwordHash: (userData as any).passwordHash ?? (existing as any)?.passwordHash ?? null,
      role: (userData as any).role ?? existing?.role ?? "user",
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.users.set(next.id, next);
    return next;
  }

  async getTeams(limit: number = 50, offset: number = 0): Promise<Team[]> {
    return Array.from(this.teams.values())
      .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
      .slice(offset, offset + limit);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    return this.insertTeam(team);
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const existing = this.teams.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...team, updatedAt: now() } as Team;
    this.teams.set(id, updated);
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    return this.teams.delete(id);
  }

  async getPlayers(teamId?: string, limit: number = 50, offset: number = 0): Promise<Player[]> {
    const all = Array.from(this.players.values());
    const filtered = teamId ? all.filter((p) => p.teamId === teamId) : all;
    return filtered.slice(offset, offset + limit);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    return this.insertPlayer(player);
  }

  async updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined> {
    const existing = this.players.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...player, updatedAt: now() } as Player;
    this.players.set(id, updated);
    return updated;
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  private toMatchWithTeams(match: Match): MatchWithTeams | undefined {
    const team1 = this.teams.get(match.team1Id);
    const team2 = this.teams.get(match.team2Id);
    if (!team1 || !team2) return undefined;
    return { ...(match as MatchWithTeams), team1, team2 };
  }

  async getMatches(status?: string, limit: number = 20, offset: number = 0): Promise<MatchWithTeams[]> {
    const all = Array.from(this.matches.values());
    const filtered = status ? all.filter((m) => m.status === status) : all;
    return filtered
      .sort((a, b) => (b.scheduledAt?.getTime() ?? 0) - (a.scheduledAt?.getTime() ?? 0))
      .slice(offset, offset + limit)
      .map((m) => this.toMatchWithTeams(m))
      .filter((m): m is MatchWithTeams => Boolean(m));
  }

  async getMatch(id: string): Promise<MatchWithTeams | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    return this.toMatchWithTeams(match);
  }

  async createMatch(match: InsertMatch): Promise<MatchWithTeams> {
    const created = this.insertMatch(match);
    const withTeams = this.toMatchWithTeams(created);
    if (!withTeams) {
      throw new Error("Invalid team ids for match");
    }
    return withTeams;
  }

  async updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined> {
    const existing = this.matches.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...match, updatedAt: now() } as Match;
    this.matches.set(id, updated);
    return updated;
  }

  async deleteMatch(id: string): Promise<boolean> {
    return this.matches.delete(id);
  }

  async getMatchEvents(matchId: string, limit: number = 100): Promise<MatchEvent[]> {
    return Array.from(this.matchEvents.values())
      .filter((e) => e.matchId === matchId)
      .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
      .slice(0, limit);
  }

  async createMatchEvent(event: InsertMatchEvent): Promise<MatchEvent> {
    return this.insertMatchEvent(event);
  }

  async getMatchPlayerStats(matchId: string): Promise<MatchPlayerStats[]> {
    return Array.from(this.matchPlayerStats.values()).filter((s) => s.matchId === matchId);
  }

  async createMatchPlayerStats(stats: InsertMatchPlayerStats): Promise<MatchPlayerStats> {
    const created = withTimestamps({ ...stats, id: uuid() }) as MatchPlayerStats;
    this.matchPlayerStats.set(created.id, created);
    return created;
  }

  async updateMatchPlayerStats(
    id: string,
    stats: Partial<InsertMatchPlayerStats>,
  ): Promise<MatchPlayerStats | undefined> {
    const existing = this.matchPlayerStats.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...stats, updatedAt: now() } as MatchPlayerStats;
    this.matchPlayerStats.set(id, updated);
    return updated;
  }

  async getNewsArticles(published?: boolean, limit: number = 20, offset: number = 0): Promise<NewsArticle[]> {
    const all = Array.from(this.newsArticles.values());
    const filtered =
      published === undefined ? all : all.filter((a) => Boolean(a.published) === published);
    return filtered
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(offset, offset + limit);
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    return this.insertNewsArticle(article);
  }

  async updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const existing = this.newsArticles.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...article, updatedAt: now() } as NewsArticle;
    this.newsArticles.set(id, updated);
    return updated;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    return this.newsArticles.delete(id);
  }

  async getComments(matchId?: string, articleId?: string, parentCommentId?: string | null): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => (matchId ? c.matchId === matchId : true))
      .filter((c) => (articleId ? c.articleId === articleId : true))
      .filter((c) => (parentCommentId !== undefined ? c.parentCommentId === parentCommentId : true))
      .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const created = withTimestamps({
      ...comment,
      id: uuid(),
      removed: false,
      flagged: false,
    }) as Comment;
    this.comments.set(created.id, created);
    return created;
  }

  async updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment | undefined> {
    const existing = this.comments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...comment, updatedAt: now() } as Comment;
    this.comments.set(id, updated);
    return updated;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async getCommentFlags(reviewed?: boolean): Promise<CommentFlag[]> {
    const all = Array.from(this.commentFlags.values());
    const filtered = reviewed === undefined ? all : all.filter((f) => f.reviewed === reviewed);
    return filtered.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async createCommentFlag(flag: InsertCommentFlag): Promise<CommentFlag> {
    const created = withTimestamps({
      ...flag,
      id: uuid(),
      reviewed: false,
    }) as CommentFlag;
    this.commentFlags.set(created.id, created);

    const comment = this.comments.get(flag.commentId);
    if (comment) {
      this.comments.set(flag.commentId, { ...comment, flagged: true, updatedAt: now() });
    }

    return created;
  }

  async updateCommentFlag(id: string, reviewed: boolean): Promise<CommentFlag | undefined> {
    const existing = this.commentFlags.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, reviewed, updatedAt: now() } as CommentFlag;
    this.commentFlags.set(id, updated);
    return updated;
  }

  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return Array.from(this.userFavorites.values())
      .filter((f) => f.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async createUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const created = withTimestamps({ ...favorite, id: uuid() }) as UserFavorite;
    this.userFavorites.set(created.id, created);
    return created;
  }

  async deleteUserFavorite(id: string): Promise<boolean> {
    return this.userFavorites.delete(id);
  }

  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const all = Array.from(this.notifications.values()).filter((n) => n.userId === userId);
    const filtered = unreadOnly ? all.filter((n) => n.read === false) : all;
    return filtered.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const created = withTimestamps({ ...notification, id: uuid(), read: false }) as Notification;
    this.notifications.set(created.id, created);
    return created;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const existing = this.notifications.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, read: true, updatedAt: now() } as Notification;
    this.notifications.set(id, updated);
    return updated;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.userSettings.get(userId);
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const existing = this.userSettings.get(settings.userId);
    const timestamp = now();
    const next: UserSettings = {
      id: existing?.id ?? uuid(),
      userId: settings.userId,
      theme: settings.theme ?? existing?.theme ?? "system",
      emailNotifications: settings.emailNotifications ?? existing?.emailNotifications ?? true,
      pushNotifications: settings.pushNotifications ?? existing?.pushNotifications ?? true,
      matchStartAlerts: settings.matchStartAlerts ?? existing?.matchStartAlerts ?? true,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.userSettings.set(settings.userId, next);
    return next;
  }

  async getLeaderboard(limit: number = 50): Promise<Player[]> {
    return Array.from(this.players.values())
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
      .slice(0, limit);
  }
}
