import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_DB: Template = {
  name: "db",
  description: "Template generated from 19 files",
  updatedAt: "2025-06-17T20:33:59.648Z",
  config: {
    files: {
      "db/drizzle/mysql/drizzle.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "15ae280850",
        },
        content: `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema",\n  out: "./src/db/migrations",\n  dialect: "mysql",\n  dbCredentials: {\n    url: process.env.DATABASE_URL || "",\n  },\n});\n`,
        type: "text",
      },
      "db/drizzle/mysql/src/db/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b86ed96e32",
        },
        content: `{{#if (or (eq runtime "bun") (eq runtime "node"))}}\nimport { drizzle } from "drizzle-orm/mysql2";\n\nexport const db = drizzle({\n  connection: {\n    uri: process.env.DATABASE_URL,\n  },\n});\n{{/if}}\n\n{{#if (eq runtime "workers")}}\nimport { drizzle } from "drizzle-orm/mysql2";\nimport { env } from "cloudflare:workers";\n\nexport const db = drizzle({\n  connection: {\n    uri: env.DATABASE_URL,\n  },\n});\n{{/if}}\n`,
        type: "text",
      },
      "db/drizzle/postgres/drizzle.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "c820ae6fa4",
        },
        content: `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema",\n  out: "./src/db/migrations",\n  dialect: "postgresql",\n  dbCredentials: {\n    url: process.env.DATABASE_URL || "",\n  },\n});\n`,
        type: "text",
      },
      "db/drizzle/postgres/src/db/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3be30c6adb",
        },
        content: `{{#if (or (eq runtime "bun") (eq runtime "node"))}}\nimport { drizzle } from "drizzle-orm/node-postgres";\n\nexport const db = drizzle(process.env.DATABASE_URL || "");\n{{/if}}\n\n{{#if (eq runtime "workers")}}\nimport { drizzle } from "drizzle-orm/node-postgres";\nimport { env } from "cloudflare:workers";\n\nexport const db = drizzle(env.DATABASE_URL || "");\n{{/if}}\n`,
        type: "text",
      },
      "db/drizzle/sqlite/drizzle.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d4cf179f87",
        },
        content: `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema",\n  out: "./src/db/migrations",\n  dialect: "turso",\n  dbCredentials: {\n    url: process.env.DATABASE_URL || "",\n    {{#if (eq dbSetup "turso")}}\n    authToken: process.env.DATABASE_AUTH_TOKEN,\n    {{/if}}\n  },\n});\n`,
        type: "text",
      },
      "db/drizzle/sqlite/src/db/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "ecc3da2b81",
        },
        content: `{{#if (or (eq runtime "bun") (eq runtime "node"))}}\nimport { drizzle } from "drizzle-orm/libsql";\nimport { createClient } from "@libsql/client";\n\nconst client = createClient({\n  url: process.env.DATABASE_URL || "",\n  {{#if (eq dbSetup "turso")}}\n  authToken: process.env.DATABASE_AUTH_TOKEN,\n  {{/if}}\n});\n\nexport const db = drizzle({ client });\n{{/if}}\n\n{{#if (eq runtime "workers")}}\nimport { drizzle } from "drizzle-orm/libsql";\nimport { env } from "cloudflare:workers";\nimport { createClient } from "@libsql/client";\n\nconst client = createClient({\n  url: env.DATABASE_URL || "",\n  {{#if (eq dbSetup "turso")}}\n  authToken: env.DATABASE_AUTH_TOKEN,\n  {{/if}}\n});\n\nexport const db = drizzle({ client });\n{{/if}}\n`,
        type: "text",
      },
      "db/mongoose/mongodb/src/db/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "4f91366182",
        },
        content: `import mongoose from "mongoose";\n\nawait mongoose.connect(process.env.DATABASE_URL || "").catch((error) => {\n  console.log("Error connecting to database:", error);\n});\n\nconst client = mongoose.connection.getClient().db("myDB");\n\nexport { client };\n`,
        type: "text",
      },
      "db/prisma/mongodb/prisma/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3d38d695ec",
        },
        content: `import { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/mongodb/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7abe9f7957",
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "mongodb"\n  url      = env("DATABASE_URL")\n}\n`,
        type: "text",
      },
      "db/prisma/mongodb/prisma.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "598eb72af6",
        },
        content: `import "dotenv/config";\nimport path from "node:path";\nimport type { PrismaConfig } from "prisma";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
      "db/prisma/mysql/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3d38d695ec",
        },
        content: `import { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/mysql/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "4b954415d2",
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "mysql"\n  url      = env("DATABASE_URL")\n}\n`,
        type: "text",
      },
      "db/prisma/mysql/prisma.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "598eb72af6",
        },
        content: `import "dotenv/config";\nimport path from "node:path";\nimport type { PrismaConfig } from "prisma";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
      "db/prisma/postgres/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3d38d695ec",
        },
        content: `import { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/postgres/prisma/schema/schema.prisma.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "044545e455",
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "postgres"\n  url      = env("DATABASE_URL")\n  {{#if (eq dbSetup "supabase")}}\n  directUrl = env("DIRECT_URL")\n  {{/if}}\n}\n`,
        type: "text",
      },
      "db/prisma/postgres/prisma.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "8e9819e0bf",
        },
        content: `{{#if (eq dbSetup "prisma-postgres")}}\n// import "dotenv/config"; uncomment this to load .env\n{{else}}\nimport "dotenv/config";\n{{/if}}\nimport path from "node:path";\nimport type { PrismaConfig } from "prisma";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
      "db/prisma/sqlite/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3d38d695ec",
        },
        content: `import { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/sqlite/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e0130abfb0",
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}\n`,
        type: "text",
      },
      "db/prisma/sqlite/prisma.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "598eb72af6",
        },
        content: `import "dotenv/config";\nimport path from "node:path";\nimport type { PrismaConfig } from "prisma";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
    },
  },
};
