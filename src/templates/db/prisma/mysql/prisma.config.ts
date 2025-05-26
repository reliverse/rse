import "dotenv/config";

import type { PrismaConfig } from "prisma";

import path from "node:path";

export default {
  earlyAccess: true,
  schema: path.join("prisma", "schema"),
} satisfies PrismaConfig;
