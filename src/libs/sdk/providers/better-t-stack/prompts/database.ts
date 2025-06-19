import { re } from "@reliverse/relico";
import { cancel, isCancel, select } from "@reliverse/rempts";

import type {
  Backend,
  Database,
  Runtime,
} from "~/libs/sdk/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getDatabaseChoice(
  database?: Database,
  backend?: Backend,
  runtime?: Runtime,
): Promise<Database> {
  if (backend === "convex" || backend === "none") {
    return "none";
  }

  if (database !== undefined) return database;

  const databaseOptions: {
    value: Database;
    label: string;
    hint: string;
  }[] = [
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

  const response = await select<Database>({
    message: "Select database",
    options: databaseOptions,
    initialValue: DEFAULT_CONFIG.database,
  });

  if (isCancel(response)) {
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
