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
    const devUser = this.insertUser({
      id: "dev-user",
      email: "dev@example.com",
      firstName: "Dev",
      lastName: "User",
      profileImageUrl: null,
      passwordHash: null,
      role: "admin",
    });

    const guestUser = this.insertUser({
      id: "guest-user",
      email: "guest@example.com",
      firstName: "Jamie",
      lastName: "Taylor",
      profileImageUrl: null,
      passwordHash: null,
      role: "user",
    });

    const teamNavi = this.insertTeam({
      name: "Natus Vincere",
      acronym: "NAVI",
      country: "UKR",
      region: "Europe",
      rank: 1,
      wins: 45,
      losses: 12,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=NAVI",
      bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
    });

    const teamFaze = this.insertTeam({
      name: "FaZe Clan",
      acronym: "FaZe",
      country: "EUR",
      region: "Europe",
      rank: 2,
      wins: 42,
      losses: 15,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=FAZE",
      bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    });

    const teamVitality = this.insertTeam({
      name: "Team Vitality",
      acronym: "VIT",
      country: "FRA",
      region: "Europe",
      rank: 3,
      wins: 38,
      losses: 18,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=VITALITY",
      bannerUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
    });

    const teamG2 = this.insertTeam({
      name: "G2 Esports",
      acronym: "G2",
      country: "EUR",
      region: "Europe",
      rank: 4,
      wins: 35,
      losses: 20,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=G2",
      bannerUrl: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?auto=format&fit=crop&w=1600&q=80",
    });

    const teamLiquid = this.insertTeam({
      name: "Team Liquid",
      acronym: "TL",
      country: "USA",
      region: "North America",
      rank: 5,
      wins: 32,
      losses: 22,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=LIQUID",
      bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    });

    const teamMouz = this.insertTeam({
      name: "MOUZ",
      acronym: "MOUZ",
      country: "DEU",
      region: "Europe",
      rank: 6,
      wins: 30,
      losses: 23,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=MOUZ",
      bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    });

    const teamFuria = this.insertTeam({
      name: "FURIA",
      acronym: "FUR",
      country: "BRA",
      region: "South America",
      rank: 7,
      wins: 28,
      losses: 24,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=FURIA",
      bannerUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80",
    });

    const teamCloud9 = this.insertTeam({
      name: "Cloud9",
      acronym: "C9",
      country: "USA",
      region: "North America",
      rank: 8,
      wins: 27,
      losses: 25,
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=CLOUD9",
      bannerUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
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
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=s1mple",
    });

    const playerBit = this.insertPlayer({
      teamId: teamNavi.id,
      alias: "b1t",
      realName: "Valerii Vakhovskyi",
      country: "UKR",
      role: "Rifler",
      totalMatches: 120,
      totalKills: 12000,
      totalDeaths: 9800,
      totalAssists: 2800,
      averageRating: 118,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=b1t",
    });

    const playerKarrigan = this.insertPlayer({
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
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=karrigan",
    });

    const playerRain = this.insertPlayer({
      teamId: teamFaze.id,
      alias: "rain",
      realName: "Havard Nygaard",
      country: "NOR",
      role: "Entry Fragger",
      totalMatches: 180,
      totalKills: 17000,
      totalDeaths: 15000,
      totalAssists: 3200,
      averageRating: 114,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=rain",
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
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=ZywOo",
    });

    this.insertPlayer({
      teamId: teamVitality.id,
      alias: "apEX",
      realName: "Dan Madesclaire",
      country: "FRA",
      role: "IGL",
      totalMatches: 220,
      totalKills: 16000,
      totalDeaths: 15500,
      totalAssists: 4200,
      averageRating: 108,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=apEX",
    });

    this.insertPlayer({
      teamId: teamG2.id,
      alias: "NiKo",
      realName: "Nikola Kovac",
      country: "BIH",
      role: "Rifler",
      totalMatches: 190,
      totalKills: 20000,
      totalDeaths: 13000,
      totalAssists: 3500,
      averageRating: 128,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=NiKo",
    });

    this.insertPlayer({
      teamId: teamG2.id,
      alias: "m0NESY",
      realName: "Ilya Osipov",
      country: "RUS",
      role: "AWPer",
      totalMatches: 90,
      totalKills: 9000,
      totalDeaths: 6000,
      totalAssists: 1500,
      averageRating: 125,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=m0NESY",
    });

    this.insertPlayer({
      teamId: teamLiquid.id,
      alias: "YEKINDAR",
      realName: "Mareks Gailins",
      country: "LVA",
      role: "Entry Fragger",
      totalMatches: 130,
      totalKills: 14000,
      totalDeaths: 12000,
      totalAssists: 2900,
      averageRating: 116,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=YEKINDAR",
    });

    this.insertPlayer({
      teamId: teamLiquid.id,
      alias: "NAF",
      realName: "Keith Markovic",
      country: "CAN",
      role: "Support",
      totalMatches: 210,
      totalKills: 17000,
      totalDeaths: 15000,
      totalAssists: 4500,
      averageRating: 112,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=NAF",
    });

    this.insertPlayer({
      teamId: teamMouz.id,
      alias: "frozen",
      realName: "David Cerny",
      country: "SVK",
      role: "Rifler",
      totalMatches: 160,
      totalKills: 15000,
      totalDeaths: 12000,
      totalAssists: 3100,
      averageRating: 120,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=frozen",
    });

    this.insertPlayer({
      teamId: teamMouz.id,
      alias: "siuhy",
      realName: "Kamil Szkaradek",
      country: "POL",
      role: "IGL",
      totalMatches: 110,
      totalKills: 9800,
      totalDeaths: 9200,
      totalAssists: 2600,
      averageRating: 109,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=siuhy",
    });

    this.insertPlayer({
      teamId: teamFuria.id,
      alias: "KSCERATO",
      realName: "Kaike Cerato",
      country: "BRA",
      role: "Rifler",
      totalMatches: 170,
      totalKills: 16500,
      totalDeaths: 14000,
      totalAssists: 3300,
      averageRating: 121,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=KSCERATO",
    });

    this.insertPlayer({
      teamId: teamFuria.id,
      alias: "yuurih",
      realName: "Yuri Santos",
      country: "BRA",
      role: "Support",
      totalMatches: 165,
      totalKills: 15000,
      totalDeaths: 13500,
      totalAssists: 3600,
      averageRating: 115,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=yuurih",
    });

    this.insertPlayer({
      teamId: teamCloud9.id,
      alias: "Ax1Le",
      realName: "Sergey Rykhtorov",
      country: "RUS",
      role: "Rifler",
      totalMatches: 175,
      totalKills: 15800,
      totalDeaths: 13000,
      totalAssists: 3400,
      averageRating: 119,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ax1Le",
    });

    this.insertPlayer({
      teamId: teamCloud9.id,
      alias: "HObbit",
      realName: "Abay Khasenov",
      country: "KAZ",
      role: "Support",
      totalMatches: 190,
      totalKills: 15200,
      totalDeaths: 13800,
      totalAssists: 3700,
      averageRating: 113,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=HObbit",
    });

    const nowMs = Date.now();
    const minutes = 60 * 1000;
    const hours = 60 * minutes;
    const days = 24 * hours;

    const liveMatch = this.insertMatch({
      team1Id: teamNavi.id,
      team2Id: teamFaze.id,
      status: "live",
      tournament: "BLAST Premier Spring Finals 2025",
      stage: "Grand Final",
      scheduledAt: new Date(nowMs - 50 * minutes),
      startedAt: new Date(nowMs - 35 * minutes),
      team1Score: 10,
      team2Score: 8,
      currentMap: "Inferno",
      maps: ["Mirage", "Inferno", "Nuke"],
      streamLinks: [
        { platform: "Twitch", url: "https://twitch.tv/blastpremier", latency: "Low" },
      ],
    });

    const liveMatchTwo = this.insertMatch({
      team1Id: teamVitality.id,
      team2Id: teamG2.id,
      status: "live",
      tournament: "ESL Pro League Season 19",
      stage: "Semi-Final",
      scheduledAt: new Date(nowMs - 60 * minutes),
      startedAt: new Date(nowMs - 40 * minutes),
      team1Score: 7,
      team2Score: 9,
      currentMap: "Ancient",
      maps: ["Anubis", "Ancient", "Nuke"],
      streamLinks: [
        { platform: "YouTube", url: "https://youtube.com/esl", latency: "Low" },
      ],
    });

    this.insertMatch({
      team1Id: teamNavi.id,
      team2Id: teamLiquid.id,
      status: "upcoming",
      tournament: "IEM Katowice 2025",
      stage: "Quarter-Final",
      scheduledAt: new Date(nowMs + 4 * hours),
      team1Score: 0,
      team2Score: 0,
      maps: ["TBD", "TBD", "TBD"],
    });

    this.insertMatch({
      team1Id: teamFaze.id,
      team2Id: teamCloud9.id,
      status: "upcoming",
      tournament: "PGL Major Copenhagen 2025",
      stage: "Group Stage",
      scheduledAt: new Date(nowMs + 2 * days),
      team1Score: 0,
      team2Score: 0,
      maps: ["TBD", "TBD", "TBD"],
    });

    const finishedMatch = this.insertMatch({
      team1Id: teamVitality.id,
      team2Id: teamMouz.id,
      status: "finished",
      tournament: "BLAST Premier Spring Groups 2025",
      stage: "Group A",
      scheduledAt: new Date(nowMs - 20 * hours),
      startedAt: new Date(nowMs - 19 * hours),
      finishedAt: new Date(nowMs - 18 * hours),
      team1Score: 16,
      team2Score: 12,
      currentMap: "Mirage",
      maps: ["Mirage", "Overpass"],
    });

    this.insertMatch({
      team1Id: teamG2.id,
      team2Id: teamFuria.id,
      status: "finished",
      tournament: "ESL Pro League Season 19",
      stage: "Group B",
      scheduledAt: new Date(nowMs - 2 * days),
      startedAt: new Date(nowMs - 2 * days + 2 * hours),
      finishedAt: new Date(nowMs - 2 * days + 4 * hours),
      team1Score: 19,
      team2Score: 17,
      currentMap: "Nuke",
      maps: ["Nuke", "Vertigo", "Overpass"],
    });

    this.insertMatchEvent({
      matchId: liveMatch.id,
      eventType: "kill",
      timestamp: new Date(nowMs - 18 * minutes),
      description: "s1mple opens the round with an AWP pick",
      playerId: playerS1mple.id,
      metadata: { weapon: "AWP", round: 8, side: "CT" },
    });

    this.insertMatchEvent({
      matchId: liveMatch.id,
      eventType: "bomb_plant",
      timestamp: new Date(nowMs - 15 * minutes),
      description: "FaZe get the bomb down on B",
      playerId: playerKarrigan.id,
      metadata: { round: 9, side: "T" },
    });

    this.insertMatchEvent({
      matchId: liveMatch.id,
      eventType: "clutch",
      timestamp: new Date(nowMs - 12 * minutes),
      description: "rain wins a 1v2 to keep FaZe close",
      playerId: playerRain.id,
      metadata: { round: 10, side: "T" },
    });

    this.insertMatchEvent({
      matchId: liveMatch.id,
      eventType: "round_end",
      timestamp: new Date(nowMs - 9 * minutes),
      description: "NAVI take the round off a fast mid hit",
      playerId: playerBit.id,
      metadata: { round: 11, side: "CT" },
    });

    this.insertMatchPlayerStats({
      matchId: liveMatch.id,
      playerId: playerS1mple.id,
      kills: 19,
      deaths: 12,
      assists: 5,
      adr: 89,
      headshotPercent: 42,
      rating: 128,
      openingKills: 3,
    });

    this.insertMatchPlayerStats({
      matchId: liveMatch.id,
      playerId: playerBit.id,
      kills: 15,
      deaths: 11,
      assists: 4,
      adr: 77,
      headshotPercent: 48,
      rating: 114,
      openingKills: 2,
    });

    this.insertMatchPlayerStats({
      matchId: liveMatch.id,
      playerId: playerKarrigan.id,
      kills: 12,
      deaths: 14,
      assists: 6,
      adr: 65,
      headshotPercent: 31,
      rating: 98,
      openingKills: 1,
    });

    this.insertMatchPlayerStats({
      matchId: liveMatch.id,
      playerId: playerRain.id,
      kills: 17,
      deaths: 13,
      assists: 3,
      adr: 82,
      headshotPercent: 39,
      rating: 121,
      openingKills: 2,
    });

    this.insertNewsArticle({
      title: "NAVI edge FaZe in a tense map one",
      subtitle: "Early highlights from the grand final",
      content: "NAVI and FaZe traded rounds early on Mirage, but NAVI close the opener 13-10 with crisp mid control and strong late-round conversions.",
      heroImageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
      tags: ["BLAST", "NAVI", "FaZe"],
      published: true,
      authorId: devUser.id,
    });

    this.insertNewsArticle({
      title: "ZywOo hits peak form in playoffs",
      subtitle: "Vitality's star continues to dominate",
      content: "ZywOo posted a 1.45 rating across the group stage and opened the semi-final with a 27-bomb. Vitality look poised for a deep run.",
      heroImageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
      tags: ["ESL", "Vitality", "Players"],
      published: true,
      authorId: devUser.id,
    });

    this.insertNewsArticle({
      title: "IEM Katowice 2025 preview",
      subtitle: "A quick look at the bracket and favorites",
      content: "Katowice is around the corner. NAVI, G2, and Vitality top the early predictions, with Liquid and MOUZ looking like strong dark horses.",
      heroImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
      tags: ["IEM", "Preview"],
      published: true,
      authorId: devUser.id,
    });

    this.insertComment({
      userId: guestUser.id,
      matchId: liveMatch.id,
      content: "Great tempo from NAVI so far.",
    });

    this.insertComment({
      userId: devUser.id,
      matchId: liveMatch.id,
      content: "FaZe needs a timeout to reset.",
    });

    const flaggedComment = this.insertComment({
      userId: guestUser.id,
      matchId: finishedMatch.id,
      content: "Check out my stream for picks and tips.",
    });

    this.insertCommentFlag({
      commentId: flaggedComment.id,
      userId: devUser.id,
      reason: "spam",
      additionalInfo: "Repeated promo text in multiple threads.",
    });

    this.insertUserFavorite({
      userId: devUser.id,
      teamId: teamNavi.id,
    });

    this.insertUserFavorite({
      userId: devUser.id,
      playerId: playerS1mple.id,
    });

    this.insertNotification({
      userId: devUser.id,
      type: "match_start",
      title: "Match is live",
      message: "NAVI vs FaZe is now live.",
      link: `/matches/${liveMatch.id}`,
      read: false,
    });

    this.insertNotification({
      userId: devUser.id,
      type: "comment_reply",
      title: "New reply",
      message: "Someone replied to your match comment.",
      link: `/matches/${liveMatchTwo.id}`,
      read: false,
    });

    this.insertUserSettings({
      userId: devUser.id,
      theme: "dark",
      emailNotifications: true,
      pushNotifications: true,
      matchStartAlerts: true,
    });
  }

  private insertUser(user: Omit<User, "createdAt" | "updatedAt">): User {
    const created = withTimestamps(user) as User;
    this.users.set(created.id, created);
    return created;
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

  private insertMatchPlayerStats(stats: InsertMatchPlayerStats): MatchPlayerStats {
    const created = withTimestamps({ ...stats, id: uuid() }) as MatchPlayerStats;
    this.matchPlayerStats.set(created.id, created);
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

  private insertComment(comment: InsertComment): Comment {
    const created = withTimestamps({
      ...comment,
      id: uuid(),
      likes: 0,
      flagged: false,
      removed: false,
      removalReason: null,
      removedBy: null,
    }) as Comment;
    this.comments.set(created.id, created);
    return created;
  }

  private insertCommentFlag(flag: InsertCommentFlag): CommentFlag {
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

  private insertUserFavorite(favorite: InsertUserFavorite): UserFavorite {
    const created = withTimestamps({ ...favorite, id: uuid() }) as UserFavorite;
    this.userFavorites.set(created.id, created);
    return created;
  }

  private insertNotification(notification: InsertNotification): Notification {
    const created = withTimestamps({ ...notification, id: uuid(), read: notification.read ?? false }) as Notification;
    this.notifications.set(created.id, created);
    return created;
  }

  private insertUserSettings(settings: InsertUserSettings): UserSettings {
    const created = withTimestamps({
      id: uuid(),
      userId: settings.userId,
      theme: settings.theme ?? "system",
      emailNotifications: settings.emailNotifications ?? true,
      pushNotifications: settings.pushNotifications ?? true,
      matchStartAlerts: settings.matchStartAlerts ?? true,
    }) as UserSettings;
    this.userSettings.set(settings.userId, created);
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
    return this.insertMatchPlayerStats(stats);
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
    return this.insertComment(comment);
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
    return this.insertCommentFlag(flag);
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
    return this.insertUserFavorite(favorite);
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
    return this.insertNotification(notification);
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
