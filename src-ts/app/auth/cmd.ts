/**
 * 👉 `bun rse auth`
 * best friend of auth+db libs like [better-auth](https://better-auth.com)
 * and [drizzle-orm](https://orm.drizzle.team).
 * example: `rse auth better-auth generate`
 */

// import { default as betterAuthGenerateCmd } from "~/app/better/auth/generate/cmd";
import { configPath, schemaPath } from "@reliverse/dler";
import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { execaCommand } from "execa";
import MagicString from "magic-string";

const notice = `/**
 * THIS FILE IS AUTO-GENERATED - DO NOT EDIT DIRECTLY
 * 
 * To modify the schema, edit src/lib/auth.ts instead,
 * then run 'bun db:auth' to regenerate this file.
 * 
 * Any direct changes to this file will be overwritten.
 */

`;

export default defineCommand({
  meta: {
    name: "auth",
    version: "1.1.2",
  },
  args: defineArgs({
    config: {
      type: "string",
      default: configPath,
      required: true,
    },
    schema: {
      type: "string",
      default: schemaPath,
      required: true,
    },
  }),
  async run({ args }) {
    const configExists = await fs.exists(args.config);
    if (!configExists) {
      relinka("error", "Config file does not exist; tried:", args.config);
      process.exit(1);
    }
    const schemaExists = await fs.exists(args.schema);
    if (!schemaExists) {
      relinka("error", "Schema file does not exist; tried:", args.schema);
      process.exit(1);
    }

    // TODO: uncomment this
    // await callCmd(betterAuthGenerateCmd, {
    //   config: configPath,
    //   output: schemaPath,
    // });

    const filePath = path.resolve(schemaPath);
    const originalContent = await fs.readFile(filePath, "utf8");

    const s = new MagicString(originalContent);
    s.prepend(notice);
    s.replace(/export const (\w+) = pgTable/g, (_match: string, tableName: string) => {
      return `export const ${tableName}Table = pgTable`;
    });

    const tableNames: string[] = [];
    const tableMatches = originalContent.matchAll(/export const (\w+) = pgTable/g);

    for (const match of tableMatches) {
      if (match[1]) {
        tableNames.push(match[1]);
      }
    }

    console.log("√ Ensured better-auth tables:", tableNames);

    for (const tableName of tableNames) {
      s.replace(new RegExp(`\\(\\)\\s*=>\\s*${tableName}\\s*\\.`, "g"), (match: string) => {
        return match.replace(tableName, `${tableName}Table`);
      });
    }

    await fs.writeFile(filePath, s.toString(), "utf8");

    await execaCommand("bun biome check --write .", {
      stdio: "inherit",
    });
  },
});
