import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  query_timeout: 120000,
  idleTimeoutMillis: 30000,
  max: 10,
  ssl: {
    rejectUnauthorized: false, // Required for many serverless Postgres providers like Nile
  },
});

export const db = drizzle(pool, { schema });
