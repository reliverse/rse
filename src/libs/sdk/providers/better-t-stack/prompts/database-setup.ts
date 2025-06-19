import { re } from "@reliverse/relico";
import { cancel, isCancel, select } from "@reliverse/rempts";

import type {
  Backend,
  DatabaseSetup,
  ORM,
} from "~/libs/sdk/providers/better-t-stack/types";

export async function getDBSetupChoice(
  databaseType: string,
  dbSetup: DatabaseSetup | undefined,
  orm?: ORM,
  backend?: Backend,
): Promise<DatabaseSetup> {
  if (backend === "convex") {
    return "none";
  }

  if (dbSetup !== undefined) return dbSetup as DatabaseSetup;

  if (databaseType === "none") {
    return "none";
  }

  if (databaseType === "sqlite" && orm === "prisma") {
    return "none";
  }

  let options: { value: DatabaseSetup; label: string; hint: string }[] = [];

  if (databaseType === "sqlite") {
    options = [
      {
        value: "turso" as const,
        label: "Turso",
        hint: "SQLite for Production. Powered by libSQL",
      },
      { value: "none" as const, label: "None", hint: "Manual setup" },
    ];
  } else if (databaseType === "postgres") {
    options = [
      {
        value: "neon" as const,
        label: "Neon Postgres",
        hint: "Serverless Postgres with branching capability",
      },
      {
        value: "supabase" as const,
        label: "Supabase",
        hint: "Local Supabase stack (requires Docker)",
      },
      ...(orm === "prisma"
        ? [
            {
              value: "prisma-postgres" as const,
              label: "Prisma Postgres",
              hint: "Instant Postgres for Global Applications",
            },
          ]
        : []),
      { value: "none" as const, label: "None", hint: "Manual setup" },
    ];
  } else if (databaseType === "mongodb") {
    options = [
      {
        value: "mongodb-atlas" as const,
        label: "MongoDB Atlas",
        hint: "The most effective way to deploy MongoDB",
      },
      { value: "none" as const, label: "None", hint: "Manual setup" },
    ];
  } else {
    return "none";
  }

  const response = await select<DatabaseSetup>({
    message: `Select ${databaseType} setup option`,
    options,
    initialValue: "none",
  });

  if (isCancel(response)) {
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
