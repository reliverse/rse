// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/orm.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { Backend, Database, ORM, Runtime } from "../types";
import { exitCancelled } from "../utils/errors";

const ormOptions = {
  prisma: {
    value: "prisma" as const,
    label: "Prisma",
    hint: "Powerful, feature-rich ORM",
  },
  mongoose: {
    value: "mongoose" as const,
    label: "Mongoose",
    hint: "Elegant object modeling tool",
  },
  drizzle: {
    value: "drizzle" as const,
    label: "Drizzle",
    hint: "Lightweight and performant TypeScript ORM",
  },
};

export async function getORMChoice(
  orm: ORM | undefined,
  hasDatabase: boolean,
  database?: Database,
  backend?: Backend,
  _runtime?: Runtime,
) {
  if (backend === "convex") {
    return "none";
  }

  if (!hasDatabase) return "none";
  if (orm !== undefined) return orm;

  const options = [
    ...(database === "mongodb"
      ? [ormOptions.prisma, ormOptions.mongoose]
      : [ormOptions.drizzle, ormOptions.prisma]),
  ];

  const response = await selectPrompt<ORM>({
    message: "Select ORM",
    options,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
