import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = drizzle(env.DATABASE_URL, { schema });

/// We are programatically applying the migrations when the server starts.
/// I may need to put this in a separate script that we execute inside
/// the systemd service.
/// https://budivoogt.com/blog/drizzle-migrations
/// https://github.com/drizzle-team/drizzle-orm/discussions/1901#discussioncomment-13327079
/// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/node-postgres/migrator.ts
/// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/migrator.ts
export async function runMigration() {
  try {
    await migrate(db, {
      migrationsFolder: "./migrations"
    });
  } catch (err) {
    console.error("Error with automatic migration.");
    throw err;
  }
}
