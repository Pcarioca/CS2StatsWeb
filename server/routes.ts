import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { sendNotificationEmail } from "./email";
import { setupAuth, isAuthenticated, isAdmin, isModerator } from "./replitAuth";
import {
  insertTeamSchema,
  insertPlayerSchema,
  insertMatchSchema,
  insertMatchEventSchema,
  insertMatchPlayerStatsSchema,
  insertNewsArticleSchema,
  insertCommentSchema,
  insertCommentFlagSchema,
  insertUserFavoriteSchema,
  insertNotificationSchema,
  insertUserSettingsSchema,
} from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // allow larger media files by default
  },
  fileFilter: (req, file, cb) => {
    // Allow common image/audio/video mime types
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm|mp3|wav|ogg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);

    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only image, audio, or video files are allowed"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        const claims = req.user.claims;
        user = await storage.upsertUser({
          id: claims.sub,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { passwordHash: _ph, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/teams", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const teams = await storage.getTeams(limit, offset);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validated);
      res.status(201).json(team);
      try {
        broadcastToAll(wss, { type: "team_created", data: team });
      } catch (err) {
        console.error("Error broadcasting team_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.patch("/api/teams/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(req.params.id, validated);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
      try {
        broadcastToAll(wss, { type: "team_updated", data: team });
      } catch (err) {
        console.error("Error broadcasting team_updated:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteTeam(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.status(204).send();
      try {
        broadcastToAll(wss, { type: "team_deleted", data: { id: req.params.id } });
      } catch (err) {
        console.error("Error broadcasting team_deleted:", err);
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  app.get("/api/players", async (req, res) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const players = await storage.getPlayers(teamId, limit, offset);
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  app.post("/api/players", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validated);
      res.status(201).json(player);
      try {
        broadcastToAll(wss, { type: "player_created", data: player });
      } catch (err) {
        console.error("Error broadcasting player_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating player:", error);
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.patch("/api/players/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(req.params.id, validated);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
      try {
        broadcastToAll(wss, { type: "player_updated", data: player });
      } catch (err) {
        console.error("Error broadcasting player_updated:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating player:", error);
      res.status(500).json({ message: "Failed to update player" });
    }
  });

  app.delete("/api/players/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deletePlayer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  app.get("/api/matches", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const matches = await storage.getMatches(status, limit, offset);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  app.post("/api/matches", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validated);
      res.status(201).json(match);
      try {
        broadcastToAll(wss, { type: "match_created", data: match });
      } catch (err) {
        console.error("Error broadcasting match_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating match:", error);
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  app.patch("/api/matches/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertMatchSchema.partial().parse(req.body);
      const match = await storage.updateMatch(req.params.id, validated);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      broadcastToAll(wss, {
        type: "match_update",
        data: match,
      });

      res.json(match);
      try {
        broadcastToAll(wss, { type: "match_updated", data: match });
      } catch (err) {
        console.error("Error broadcasting match_updated:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating match:", error);
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  app.delete("/api/matches/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteMatch(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.status(204).send();
      try {
        broadcastToAll(wss, { type: "match_deleted", data: { id: req.params.id } });
      } catch (err) {
        console.error("Error broadcasting match_deleted:", err);
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ message: "Failed to delete match" });
    }
  });

  app.get("/api/matches/:id/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const events = await storage.getMatchEvents(req.params.id, limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching match events:", error);
      res.status(500).json({ message: "Failed to fetch match events" });
    }
  });

  app.post("/api/matches/:id/events", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertMatchEventSchema.parse({
        ...req.body,
        matchId: req.params.id,
      });
      const event = await storage.createMatchEvent(validated);

      broadcastToAll(wss, {
        type: "match_event",
        data: event,
      });

      // Send email notifications when a match event is created (if configured)
      try {
        const notify = process.env.NOTIFY_EMAILS;
        if (notify) {
          const recipients = notify.split(",").map((s) => s.trim()).filter(Boolean);
          const subject = `Match event: ${event.eventType}`;
          const text = `An event occurred for match ${event.matchId}: ${event.description}\n\nDetails:\n${JSON.stringify(event, null, 2)}`;
          await sendNotificationEmail(recipients, subject, text);
        }
      } catch (err) {
        console.error("Error sending notification email:", err);
      }

      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating match event:", error);
      res.status(500).json({ message: "Failed to create match event" });
    }
  });

  app.get("/api/matches/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getMatchPlayerStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching match stats:", error);
      res.status(500).json({ message: "Failed to fetch match stats" });
    }
  });

  app.post("/api/matches/:id/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertMatchPlayerStatsSchema.parse({
        ...req.body,
        matchId: req.params.id,
      });
      const stats = await storage.createMatchPlayerStats(validated);
      res.status(201).json(stats);
      try {
        broadcastToAll(wss, { type: "match_stats_created", data: stats });
      } catch (err) {
        console.error("Error broadcasting match_stats_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating match stats:", error);
      res.status(500).json({ message: "Failed to create match stats" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const articles = await storage.getNewsArticles(published, limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/news", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertNewsArticleSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const article = await storage.createNewsArticle(validated);
      res.status(201).json(article);
      try {
        broadcastToAll(wss, { type: "news_created", data: article });
      } catch (err) {
        console.error("Error broadcasting news_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/news/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertNewsArticleSchema.partial().parse(req.body);
      const article = await storage.updateNewsArticle(req.params.id, validated);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
      try {
        broadcastToAll(wss, { type: "news_updated", data: article });
      } catch (err) {
        console.error("Error broadcasting news_updated:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/news/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteNewsArticle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(204).send();
      try {
        broadcastToAll(wss, { type: "news_deleted", data: { id: req.params.id } });
      } catch (err) {
        console.error("Error broadcasting news_deleted:", err);
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  app.get("/api/comments", async (req, res) => {
    try {
      const matchId = req.query.matchId as string | undefined;
      const articleId = req.query.articleId as string | undefined;
      const parentCommentId = req.query.parentCommentId as string | undefined | null;
      const comments = await storage.getComments(matchId, articleId, parentCommentId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertCommentSchema.parse({
        ...req.body,
        userId,
      });
      const comment = await storage.createComment(validated);
      res.status(201).json(comment);
      try {
        broadcastToAll(wss, { type: "comment_created", data: comment });
      } catch (err) {
        console.error("Error broadcasting comment_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.patch("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comment = await storage.getComment(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validated = insertCommentSchema.partial().parse(req.body);
      const updated = await storage.updateComment(req.params.id, validated);
      res.json(updated);
      try {
        broadcastToAll(wss, { type: "comment_updated", data: comment });
      } catch (err) {
        console.error("Error broadcasting comment_updated:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comment = await storage.getComment(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.userId !== userId) {
        const user = await storage.getUser(userId);
        if (!user || (user.role !== "admin" && user.role !== "moderator")) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      const deleted = await storage.deleteComment(req.params.id);
      res.status(204).send();
      try {
        broadcastToAll(wss, { type: "comment_deleted", data: { id: req.params.id } });
      } catch (err) {
        console.error("Error broadcasting comment_deleted:", err);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.post("/api/comments/:id/flag", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertCommentFlagSchema.parse({
        ...req.body,
        commentId: req.params.id,
        userId,
      });
      const flag = await storage.createCommentFlag(validated);
      res.status(201).json(flag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error flagging comment:", error);
      res.status(500).json({ message: "Failed to flag comment" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertUserFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const favorite = await storage.createUserFavorite(validated);
      res.status(201).json(favorite);
      try {
        broadcastToAll(wss, { type: "favorite_created", data: favorite });
      } catch (err) {
        console.error("Error broadcasting favorite_created:", err);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating favorite:", error);
      res.status(500).json({ message: "Failed to create favorite" });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteUserFavorite(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.status(204).send();
      try {
        broadcastToAll(wss, { type: "favorite_deleted", data: { id: req.params.id } });
      } catch (err) {
        console.error("Error broadcasting favorite_deleted:", err);
      }
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unread === "true";
      const notifications = await storage.getNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      if (!settings) {
        const defaultSettings = await storage.upsertUserSettings({ userId });
        return res.json(defaultSettings);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertUserSettingsSchema.parse({
        ...req.body,
        userId,
      });
      const settings = await storage.upsertUserSettings(validated);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.get("/api/leaderboards", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/admin/flags", isAuthenticated, isModerator, async (req, res) => {
    try {
      const reviewed = req.query.reviewed === "true" ? true : req.query.reviewed === "false" ? false : undefined;
      const flags = await storage.getCommentFlags(reviewed);
      res.json(flags);
    } catch (error) {
      console.error("Error fetching flags:", error);
      res.status(500).json({ message: "Failed to fetch flags" });
    }
  });

  app.patch("/api/admin/flags/:id", isAuthenticated, isModerator, async (req, res) => {
    try {
      const flag = await storage.updateCommentFlag(req.params.id, true);
      if (!flag) {
        return res.status(404).json({ message: "Flag not found" });
      }
      res.json(flag);
    } catch (error) {
      console.error("Error updating flag:", error);
      res.status(500).json({ message: "Failed to update flag" });
    }
  });

  app.patch("/api/admin/comments/:id", isAuthenticated, isModerator, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = z.object({
        removed: z.boolean(),
        removalReason: z.string().optional(),
      }).parse(req.body);

      const updated = await storage.updateComment(req.params.id, {
        ...validated,
        removedBy: userId,
      });

      if (!updated) {
        return res.status(404).json({ message: "Comment not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/admin/comments/:id", isAuthenticated, isModerator, async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.post("/api/upload", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const type = req.body.type || "misc";
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname) || "";
      const filename = `${req.file.fieldname || "file"}-${uniqueSuffix}${ext}`;

      // Use storage provider (S3 if configured, otherwise local)
      const { uploadFile } = await import("./storageProvider");
      const url = await uploadFile(req.file.buffer, filename, type, req.file.mimetype);

      res.status(201).json({ url });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", async (message) => {
      try {
        const text = message.toString();
        console.log("Received message:", text);
        let payload: any;
        try {
          payload = JSON.parse(text);
        } catch (err) {
          // ignore non-json messages
          return;
        }

        // Handle create match event via WebSocket: store in DB and broadcast
        if (payload?.type === "create_match_event") {
          try {
            const validated = insertMatchEventSchema.parse(payload.data);
            const event = await storage.createMatchEvent(validated);

            broadcastToAll(wss, { type: "match_event", data: event });

            // send notification emails if configured
            try {
              const notify = process.env.NOTIFY_EMAILS;
              if (notify) {
                const recipients = notify.split(",").map((s) => s.trim()).filter(Boolean);
                const subject = `Match event: ${event.eventType}`;
                const textBody = `An event occurred for match ${event.matchId}: ${event.description}\n\nDetails:\n${JSON.stringify(event, null, 2)}`;
                await sendNotificationEmail(recipients, subject, textBody);
              }
            } catch (err) {
              console.error("Error sending notification email from WS:", err);
            }

            ws.send(JSON.stringify({ type: "create_match_event:ok", data: event }));
          } catch (err) {
            console.error("Error processing create_match_event via WS:", err);
            ws.send(JSON.stringify({ type: "create_match_event:error", message: (err as any)?.message || "Invalid data" }));
          }
        }

        // Handle request to retrieve match events
        if (payload?.type === "get_match_events") {
          try {
            const matchId = payload.matchId || payload.data?.matchId;
            if (!matchId) {
              ws.send(JSON.stringify({ type: "get_match_events:error", message: "matchId required" }));
            } else {
              const events = await storage.getMatchEvents(matchId, payload.limit || 100);
              ws.send(JSON.stringify({ type: "match_events", data: events }));
            }
          } catch (err) {
            console.error("Error fetching match events via WS:", err);
            ws.send(JSON.stringify({ type: "get_match_events:error", message: "Failed to fetch" }));
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    try {
      ws.send(JSON.stringify({ type: "connected", message: "Welcome to CS2Stats WebSocket" }));
    } catch (error) {
      console.error("Error sending WebSocket welcome message:", error);
    }
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });

  return httpServer;
}

function broadcastToAll(wss: WebSocketServer, data: any) {
  try {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error("Error broadcasting to WebSocket client:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error in broadcastToAll:", error);
  }
}
