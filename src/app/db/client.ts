import { createClient } from "@libsql/client/node";
import { ensuredir } from "@reliverse/fs";
import { relinka } from "@reliverse/prompts";
import { drizzle } from "drizzle-orm/libsql/node";

import { memoryPath, cliHomeDir } from "~/libs/cfg/constants/cfg-details.js";

// Ensure the directory exists
await ensuredir(cliHomeDir);

const client = createClient({
  url: `file:${memoryPath}`,
});
const db = drizzle(client);

// Initialize database schema
async function initializeDatabase() {
  try {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS config_keys (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS user_data (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
    ]);
  } catch (error) {
    relinka(
      "error",
      "Failed to initialize database:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

// Initialize database on first connection
await initializeDatabase();

export { db };
