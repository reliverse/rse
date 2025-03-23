import { defineConfig } from "drizzle-kit";

import { memoryPath } from "./src/libs/cfg/constants/cfg-details.js";

export default defineConfig({
  out: "./drizzle",
  dialect: "sqlite",
  schema: "./src/app/db/schema.ts",
  dbCredentials: { url: `file:${memoryPath}` },
});
