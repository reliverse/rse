/* 
best friend of auth+db libs like [better-auth](https://better-auth.com) and [drizzle-orm](https://orm.drizzle.team).

```bash
rse auth better-auth generate
```
*/

// 👉 `bun db:auth`

import { defineArgs, defineCommand, runCmd } from "@reliverse/rempts";
import { execaCommand } from "execa";
import fs from "@reliverse/relifso";
import MagicString from "magic-string";
import path from "@reliverse/pathkit";

import { cmdAuthGenerate } from "~/app/cmds";

import { configPath, schemaPath } from "./consts";

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
    name: "better better-auth cli",
    version: "1.1.2",
  },
  args: defineArgs({
    config: {
      type: "string",
      default: configPath,
    },
    schema: {
      type: "string",
      output: schemaPath,
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run({ args }) {
    await runCmd(await cmdAuthGenerate(), [
      `--config ${configPath} --output ${schemaPath}`,
    ]);

    const filePath = path.resolve(schemaPath);
    const originalContent = await fs.readFile(filePath, "utf8");

    const s = new MagicString(originalContent);
    s.prepend(notice);
    s.replace(
      /export const (\w+) = pgTable/g,
      (_match: string, tableName: string) => {
        return `export const ${tableName}Table = pgTable`;
      },
    );

    const tableNames: string[] = [];
    const tableMatches = originalContent.matchAll(
      /export const (\w+) = pgTable/g,
    );

    for (const match of tableMatches) {
      if (match[1]) {
        tableNames.push(match[1]);
      }
    }

    console.log("√ Ensured better-auth tables:", tableNames);

    for (const tableName of tableNames) {
      s.replace(
        new RegExp(`\\(\\)\\s*=>\\s*${tableName}\\s*\\.`, "g"),
        (match: string) => {
          return match.replace(tableName, `${tableName}Table`);
        },
      );
    }

    await fs.writeFile(filePath, s.toString(), "utf8");

    await execaCommand("bun biome check --write .", {
      stdio: "inherit",
    });
  },
});
