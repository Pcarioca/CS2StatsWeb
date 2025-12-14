import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const pool = hasDatabase
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : undefined;

export const db = pool ? drizzle({ client: pool, schema }) : undefined;
