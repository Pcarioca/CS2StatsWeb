import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendRegistrationEmail } from "./email";

export type AuthMode = "local" | "replit" | "dev";

export function getAuthMode(): AuthMode {
  const mode = (process.env.AUTH_MODE ?? "").toLowerCase();
  if (mode === "replit" || mode === "local" || mode === "dev") return mode;
  return "local";
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;

  const sessionSecret = process.env.SESSION_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-session-secret" : undefined);

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set (or set a SESSION_SECRET in your .env).");
  }

  const sessionStore = process.env.DATABASE_URL
    ? new (connectPg(session))({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
      })
    : new (createMemoryStore(session))({
        checkPeriod: 24 * 60 * 60 * 1000,
      });

  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

function setLocalUserSession(req: any, dbUser: any) {
  (req.session as any).userId = dbUser.id;
  (req as any).user = {
    claims: {
      sub: dbUser.id,
      email: dbUser.email,
      first_name: dbUser.firstName,
      last_name: dbUser.lastName,
      profile_image_url: dbUser.profileImageUrl,
    },
    expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Initialize passport for social strategies regardless of AUTH_MODE (except dev)
  app.use(passport.initialize());
  app.use(passport.session());

  // Register Google and GitHub strategies early so they are available in `local` mode as well.
  // These will only be activated if the relevant env vars are provided.
  const registerOAuthProviders = () => {
    // Setup Google strategy if configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/google/callback`,
            scope: ["profile", "email"],
          },
          async (accessToken: any, refreshToken: any, profile: any, done: any) => {
            try {
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
              const names = (profile.name || {}) as any;
              const firstName = names.givenName ?? names.familyName ?? undefined;
              const lastName = names.familyName ?? undefined;
              const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;
              const id = `google:${profile.id}`;
              const userObj = await buildPassportUser(id, email, firstName, lastName, picture, accessToken, refreshToken);
              done(null, userObj as any);
            } catch (err) {
              done(err as any);
            }
          },
        ),
      );
    }

    // Setup GitHub strategy if configured
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
      passport.use(
        new GitHubStrategy(
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${baseUrl}/api/auth/github/callback`,
            scope: ["user:email"],
          },
          async (accessToken: any, refreshToken: any, profile: any, done: any) => {
            try {
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
              const displayName = profile.displayName || profile.username;
              const nameParts = (displayName || "").split(" ");
              const firstName = nameParts[0] ?? undefined;
              const lastName = nameParts.slice(1).join(" ") || undefined;
              const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;
              const id = `github:${profile.id}`;
              const userObj = await buildPassportUser(id, email, firstName, lastName, picture, accessToken, refreshToken);
              done(null, userObj as any);
            } catch (err) {
              done(err as any);
            }
          },
        ),
      );
    }
  };

  // call early registration
  registerOAuthProviders();

  // Development-only simulation routes to emulate OAuth provider callbacks
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/auth/simulate/:provider", async (req, res) => {
      try {
        const provider = req.params.provider || "google";
        const id = `${provider}:sim-${Date.now()}`;
        const email = `${provider}.test@example.com`;
        const firstName = "Sim";
        const lastName = "User";
        const picture = null;
        const accessToken = "simulated-access-token";
        const refreshToken = "simulated-refresh-token";

        const userObj = await buildPassportUser(id, email, firstName, lastName, picture, accessToken, refreshToken);

        // Establish a login session using passport
        req.login(userObj, (err: any) => {
          if (err) {
            console.error("Simulation login error:", err);
            return res.status(500).json({ message: "Failed to simulate login" });
          }
          res.redirect("/");
        });
      } catch (err) {
        console.error("Simulation error:", err);
        res.status(500).json({ message: "Simulation failed" });
      }
    });
  }

  const authMode = getAuthMode();

  if (authMode === "dev") {
    const devUserId = process.env.DEV_USER_ID ?? "dev-user";
    const devEmail = process.env.DEV_EMAIL ?? "dev@example.com";
    const devRole = (process.env.DEV_ROLE ?? "admin") as any;

    await storage.upsertUser({
      id: devUserId,
      email: devEmail,
      firstName: "Dev",
      lastName: "User",
      profileImageUrl: null,
      role: devRole,
    } as any);

    app.get("/api/login", (req, res) => {
      (req.session as any).devUserId = devUserId;
      res.redirect("/");
    });

    app.get("/api/logout", (req, res) => {
      req.session.destroy(() => res.redirect("/"));
    });

    return;
  }
  if (authMode === "local") {
    app.get("/api/login", (_req, res) => res.redirect("/login"));

    app.get("/api/logout", (req, res) => {
      req.session.destroy(() => res.redirect("/"));
    });

    app.post("/api/auth/register", async (req: any, res) => {
      try {
        const validated = z.object({
          email: z.string().email(),
          password: z.string().min(8),
          firstName: z.string().min(1).max(100).optional(),
          lastName: z.string().min(1).max(100).optional(),
        }).parse(req.body);

        const email = validated.email.toLowerCase();
        const existing = await storage.getUserByEmail(email);
        if (existing) {
          return res.status(409).json({ message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(validated.password, 12);
        const user = await storage.upsertUser({
          email,
          firstName: validated.firstName ?? null,
          lastName: validated.lastName ?? null,
          profileImageUrl: null,
          role: "user",
          passwordHash,
        } as any);

        setLocalUserSession(req, user);

        await sendRegistrationEmail(email);

        const { passwordHash: _ph, ...safeUser } = user as any;
        res.status(201).json(safeUser);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid data", errors: error.errors });
        }
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Failed to register" });
      }
    });

    app.post("/api/auth/login", async (req: any, res) => {
      try {
        const validated = z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }).parse(req.body);

        const email = validated.email.toLowerCase();
        const user = await storage.getUserByEmail(email);
        const passwordHash = (user as any)?.passwordHash as string | null | undefined;

        if (!user || !passwordHash) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const ok = await bcrypt.compare(validated.password, passwordHash);
        if (!ok) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        setLocalUserSession(req, user);

        const { passwordHash: _ph, ...safeUser } = user as any;
        res.json(safeUser);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid data", errors: error.errors });
        }
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Failed to login" });
      }
    });

    return;
  }

  if (!process.env.REPL_ID) {
    throw new Error('AUTH_MODE="replit" requires REPL_ID to be set.');
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Helper to build a user-like object compatible with existing flows
  async function buildPassportUser(providerId: string, email: string | undefined, firstName?: string | null, lastName?: string | null, picture?: string | null, accessToken?: string, refreshToken?: string) {
    const id = providerId;
    // Upsert to DB
    const dbUser = await storage.upsertUser({
      id,
      email: email ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      profileImageUrl: picture ?? null,
      role: "user",
    } as any);

    const userObj: any = {
      claims: {
        sub: dbUser.id,
        email: dbUser.email,
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        profile_image_url: dbUser.profileImageUrl,
      },
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    return userObj;
  }

  // Setup Google strategy if configured
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${baseUrl}/api/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
            const names = (profile.name || {}) as any;
            const firstName = names.givenName ?? names.familyName ?? undefined;
            const lastName = names.familyName ?? undefined;
            const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;
            const id = `google:${profile.id}`;
            const userObj = await buildPassportUser(id, email, firstName, lastName, picture, accessToken, refreshToken);
            done(null, userObj as any);
          } catch (err) {
            done(err as any);
          }
        },
      ),
    );

    app.get(
      "/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] }),
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        res.redirect("/");
      },
    );
  }

  // Setup GitHub strategy if configured
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${baseUrl}/api/auth/github/callback`,
          scope: ["user:email"],
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            // GitHub may return multiple emails
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
            const displayName = profile.displayName || profile.username;
            const nameParts = (displayName || "").split(" ");
            const firstName = nameParts[0] ?? undefined;
            const lastName = nameParts.slice(1).join(" ") || undefined;
            const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;
            const id = `github:${profile.id}`;
            const userObj = await buildPassportUser(id, email, firstName, lastName, picture, accessToken, refreshToken);
            done(null, userObj as any);
          } catch (err) {
            done(err as any);
          }
        },
      ),
    );

    app.get(
      "/api/auth/github",
      passport.authenticate("github", { scope: ["user:email"] }),
    );

    app.get(
      "/api/auth/github/callback",
      passport.authenticate("github", { failureRedirect: "/login" }),
      (req, res) => {
        res.redirect("/");
      },
    );
  }

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authMode = getAuthMode();

  if (authMode === "dev") {
    const devUserId = (req.session as any)?.devUserId as string | undefined;
    if (!devUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = {
      claims: {
        sub: devUserId,
        email: process.env.DEV_EMAIL ?? "dev@example.com",
        first_name: "Dev",
        last_name: "User",
        profile_image_url: null,
      },
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };
    return next();
  }

  if (authMode === "local") {
    const userId = (req.session as any)?.userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(userId);
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = {
      claims: {
        sub: dbUser.id,
        email: dbUser.email,
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        profile_image_url: dbUser.profileImageUrl,
      },
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dbUser = await storage.getUser(user.claims.sub);
  if (!dbUser || dbUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

export const isModerator: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dbUser = await storage.getUser(user.claims.sub);
  if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "moderator")) {
    return res.status(403).json({ message: "Forbidden: Moderator access required" });
  }

  next();
};
