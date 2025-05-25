import { logger, type Adapter, type BetterAuthOptions } from "better-auth";
import { generateDrizzleSchema } from "./drizzle.js";
import { generatePrismaSchema } from "./prisma.js";
import { generateMigrations } from "./kysely.js";

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
