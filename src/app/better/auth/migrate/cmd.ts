import { re } from "@reliverse/relico";
import { pathExists } from "@reliverse/relifso";
import {
  confirmPrompt,
  defineArgs,
  defineCommand,
  useSpinner,
} from "@reliverse/rempts";
import { logger } from "better-auth";
import { getAdapter, getMigrations } from "better-auth/db";
import path from "path";
import { z } from "zod";

import { getConfig } from "~/app/better/auth/(utils)/get-config";
import { configPath } from "~/app/better/auth/consts";

interface MigrateActionOpts {
  cwd: string;
  config: string;
  y: boolean;
}

export async function migrateAction(opts: MigrateActionOpts) {
  const options = z
    .object({
      cwd: z.string(),
      config: z.string().optional(),
      y: z.boolean().optional(),
    })
    .parse(opts);
  const cwd = path.resolve(options.cwd);
  if (!(await pathExists(cwd))) {
    logger.error(`The directory "${cwd}" does not exist.`);
    process.exit(1);
  }
  const config = await getConfig({
    cwd,
    configPath: options.config,
  });
  if (!config) {
    logger.error(
      "No configuration file found. Add a `auth.ts` file to your project or pass the path to the configuration file using the `--config` flag.",
    );
    return;
  }

  const db = await getAdapter(config);

  if (!db) {
    logger.error(
      "Invalid database configuration. Make sure you're not using adapters. Migrate command only works with built-in Kysely adapter.",
    );
    process.exit(1);
  }

  if (db.id !== "kysely") {
    if (db.id === "prisma") {
      logger.error(
        "The migrate command only works with the built-in Kysely adapter. For Prisma, run `npx @better-auth/cli generate` to create the schema, then use Prisma's migrate or push to apply it.",
      );
      process.exit(0);
    }
    if (db.id === "drizzle") {
      logger.error(
        "The migrate command only works with the built-in Kysely adapter. For Drizzle, run `npx @better-auth/cli generate` to create the schema, then use Drizzle's migrate or push to apply it.",
      );
      process.exit(0);
    }
    logger.error("Migrate command isn't supported for this adapter.");
    process.exit(1);
  }

  const spinner = useSpinner({ text: "preparing migration..." }).start();

  const { toBeAdded, toBeCreated, runMigrations } = await getMigrations(config);

  if (!toBeAdded.length && !toBeCreated.length) {
    spinner.stop();
    logger.info("🚀 No migrations needed.");
    process.exit(0);
  }

  spinner.stop();
  logger.info("🔑 The migration will affect the following:");

  for (const table of [...toBeCreated, ...toBeAdded]) {
    console.log(
      "->",
      re.magenta(Object.keys(table.fields).join(", ")),
      re.white("fields on"),
      re.yellow(table.table),
      re.white("table."),
    );
  }

  let migrate = options.y;
  if (!migrate) {
    const response = await confirmPrompt({
      title: "migrate",
      content: "Are you sure you want to run these migrations?",
      defaultValue: false,
    });
    migrate = response;
  }

  if (!migrate) {
    logger.info("Migration cancelled.");
    process.exit(0);
  }

  spinner?.start("migrating...");
  await runMigrations();
  spinner.stop();
  logger.info("🚀 migration was completed successfully!");
  process.exit(0);
}

export default defineCommand({
  meta: {
    name: "migrate",
  },
  args: defineArgs({
    cwd: {
      type: "string",
      description: "The working directory. defaults to the current directory.",
      default: process.cwd(),
    },
    config: {
      type: "string",
      description:
        "The path to the configuration file. defaults to the first configuration file found.",
      default: configPath,
    },
    y: {
      type: "boolean",
      description: "Automatically accept and run migrations without prompting",
      default: false,
    },
  }),
  async run({ args }) {
    await migrateAction(args);
  },
});
