import { logger, type Adapter, type BetterAuthOptions } from "better-auth";

import { generateDrizzleSchema } from "./drizzle";
import { generateMigrations } from "./kysely";
import { generatePrismaSchema } from "./prisma";

export const adapters = {
  prisma: generatePrismaSchema,
  drizzle: generateDrizzleSchema,
  kysely: generateMigrations,
};

export const getGenerator = (opts: {
  adapter: Adapter;
  file?: string;
  options: BetterAuthOptions;
}) => {
  const adapter = opts.adapter;
  const generator =
    adapter.id in adapters
      ? adapters[adapter.id as keyof typeof adapters]
      : null;
  if (!generator) {
    logger.error(`${adapter.id} is not supported.`);
    process.exit(1);
  }
  return generator(opts);
};
