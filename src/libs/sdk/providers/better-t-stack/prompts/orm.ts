import { cancel, isCancel, select } from "@clack/prompts";
import pc from "picocolors";

import type {
  ProjectBackend,
  ProjectDatabase,
  ProjectOrm,
} from "~/libs/sdk/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

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
  orm: ProjectOrm | undefined,
  hasDatabase: boolean,
  database?: ProjectDatabase,
  backend?: ProjectBackend,
): Promise<ProjectOrm> {
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

  const response = await select<ProjectOrm>({
    message: "Select ORM",
    options,
    initialValue: database === "mongodb" ? "prisma" : DEFAULT_CONFIG.orm,
  });

  if (isCancel(response)) {
    cancel(pc.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
