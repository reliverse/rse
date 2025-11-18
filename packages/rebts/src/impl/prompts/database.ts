// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { Backend, Database, Runtime } from "../types";
import { exitCancelled } from "../utils/errors";

export async function getDatabaseChoice(
  database?: Database,
  backend?: Backend,
  runtime?: Runtime,
) {
  if (backend === "convex" || backend === "none") {
    return "none";
  }

  if (database !== undefined) return database;

  const databaseOptions: Array<{
    value: Database;
    label: string;
    hint: string;
  }> = [
    {
      value: "none",
      label: "None",
      hint: "No database setup",
    },
    {
      value: "sqlite",
      label: "SQLite",
      hint: "lightweight, server-less, embedded relational database",
    },
    {
      value: "postgres",
      label: "PostgreSQL",
      hint: "powerful, open source object-relational database system",
    },
    {
      value: "mysql",
      label: "MySQL",
      hint: "popular open-source relational database system",
    },
  ];

  if (runtime !== "workers") {
    databaseOptions.push({
      value: "mongodb",
      label: "MongoDB",
      hint: "open-source NoSQL database that stores data in JSON-like documents called BSON",
    });
  }

  const response = await selectPrompt<Database>({
    message: "Select database",
    options: databaseOptions,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
