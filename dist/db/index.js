import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
// In production (Cloud Run), DATABASE_URL will be injected securely via environment variables
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing!');
}
// Disable prefetch for safe connection pooling with serverless environments like Cloud Run / Neon
const client = postgres(connectionString, { max: 1, prepare: false });
export const db = drizzle(client, { schema });
