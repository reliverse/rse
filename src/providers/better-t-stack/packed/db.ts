import type { Template } from "../better-t-stack-types.ts";

export const DLER_TPL_DB: Template = {
  name: "db",
  description: "Template generated from 19 files",
  updatedAt: "2025-06-17T17:18:47.025Z",
  config: {
    files: {
      "db/drizzle/mysql/drizzle.config.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.771Z",
          updatedHash: "15ae280850"
        },
        content: `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema",\n  out: "./src/db/migrations",\n  dialect: "mysql",\n  dbCredentials: {\n    url: process.env.DATABASE_URL || "",\n  },\n});\n`,
        type: "text",
      },
      "db/drizzle/mysql/src/db/index.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.799Z",
          updatedHash: "8c6e8a8539"
        },
        content: `import { drizzle } from "drizzle-orm/mysql2";\n\nexport const db = drizzle({ connection: { uri: process.env.DATABASE_URL } });\n`,
        type: "text",
      },
      "db/drizzle/postgres/drizzle.config.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.827Z",
          updatedHash: "c820ae6fa4"
        },
        content: `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema",\n  out: "./src/db/migrations",\n  dialect: "postgresql",\n  dbCredentials: {\n    url: process.env.DATABASE_URL || "",\n  },\n});\n`,
        type: "text",
      },
      "db/drizzle/postgres/src/db/index.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.856Z",
          updatedHash: "3f313f8258"
        },
        content: `import { drizzle } from "drizzle-orm/node-postgres";\n\nexport const db = drizzle(process.env.DATABASE_URL || "");\n`,
        type: "text",
      },
      "db/drizzle/sqlite/drizzle.config.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.881Z",
          updatedHash: "2a4b42f707"
        },
        content: `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema",\n  out: "./src/db/migrations",\n  dialect: "turso",\n  dbCredentials: {\n    url: process.env.DATABASE_URL || "",\n    authToken: process.env.DATABASE_AUTH_TOKEN,\n  },\n});\n`,
        type: "text",
      },
      "db/drizzle/sqlite/src/db/index.ts": {
        metadata: {
          updatedAt: "2025-05-26T13:05:11.494Z",
          updatedHash: "9780680263"
        },
        content: `import { createClient } from "@libsql/client";\nimport { drizzle } from "drizzle-orm/libsql";\n\nconst client = createClient({\n  url: process.env.DATABASE_URL || "",\n  authToken: process.env.DATABASE_AUTH_TOKEN,\n});\n\nexport const db = drizzle({ client });\n`,
        type: "text",
      },
      "db/mongoose/mongodb/src/db/index.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.945Z",
          updatedHash: "4f91366182"
        },
        content: `import mongoose from "mongoose";\n\nawait mongoose.connect(process.env.DATABASE_URL || "").catch((error) => {\n  console.log("Error connecting to database:", error);\n});\n\nconst client = mongoose.connection.getClient().db("myDB");\n\nexport { client };\n`,
        type: "text",
      },
      "db/prisma/mongodb/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-11T09:07:20.801Z",
          updatedHash: "b40f01e6ea"
        },
        content: `// @ts-expect-error <dler-remove-comment>\nimport { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/mongodb/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-05-04T11:48:17.025Z",
          updatedHash: "7abe9f7957"
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "mongodb"\n  url      = env("DATABASE_URL")\n}\n`,
        type: "text",
      },
      "db/prisma/mongodb/prisma.config.ts": {
        metadata: {
          updatedAt: "2025-05-26T12:39:23.593Z",
          updatedHash: "580bac8720"
        },
        content: `import "dotenv/config";\n\nimport type { PrismaConfig } from "prisma";\n\nimport path from "node:path";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
      "db/prisma/mysql/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-11T09:07:20.893Z",
          updatedHash: "b40f01e6ea"
        },
        content: `// @ts-expect-error <dler-remove-comment>\nimport { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/mysql/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-05-04T11:48:17.095Z",
          updatedHash: "4b954415d2"
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "mysql"\n  url      = env("DATABASE_URL")\n}\n`,
        type: "text",
      },
      "db/prisma/mysql/prisma.config.ts": {
        metadata: {
          updatedAt: "2025-05-26T12:39:23.593Z",
          updatedHash: "580bac8720"
        },
        content: `import "dotenv/config";\n\nimport type { PrismaConfig } from "prisma";\n\nimport path from "node:path";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
      "db/prisma/postgres/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-11T09:07:20.715Z",
          updatedHash: "b40f01e6ea"
        },
        content: `// @ts-expect-error <dler-remove-comment>\nimport { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/postgres/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-05-04T11:48:17.169Z",
          updatedHash: "0b2dd57a9c"
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "postgres"\n  url      = env("DATABASE_URL")\n}\n`,
        type: "text",
      },
      "db/prisma/postgres/prisma.config.ts": {
        metadata: {
          updatedAt: "2025-05-26T12:39:23.593Z",
          updatedHash: "580bac8720"
        },
        content: `import "dotenv/config";\n\nimport type { PrismaConfig } from "prisma";\n\nimport path from "node:path";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      },
      "db/prisma/sqlite/prisma/index.ts": {
        metadata: {
          updatedAt: "2025-06-11T09:07:20.642Z",
          updatedHash: "b40f01e6ea"
        },
        content: `// @ts-expect-error <dler-remove-comment>\nimport { PrismaClient } from "./generated/client";\n\nconst prisma = new PrismaClient();\n\nexport default prisma;\n`,
        type: "text",
      },
      "db/prisma/sqlite/prisma/schema/schema.prisma": {
        metadata: {
          updatedAt: "2025-05-04T11:48:17.241Z",
          updatedHash: "2c881bbb63"
        },
        content: `generator client {\n  provider = "prisma-client"\n  output   = "../generated"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "sqlite"\n  url      = "file:../local.db"\n}\n`,
        type: "text",
      },
      "db/prisma/sqlite/prisma.config.ts": {
        metadata: {
          updatedAt: "2025-05-26T12:39:23.593Z",
          updatedHash: "580bac8720"
        },
        content: `import "dotenv/config";\n\nimport type { PrismaConfig } from "prisma";\n\nimport path from "node:path";\n\nexport default {\n  earlyAccess: true,\n  schema: path.join("prisma", "schema"),\n} satisfies PrismaConfig;\n`,
        type: "text",
      }
    },
  },
};
