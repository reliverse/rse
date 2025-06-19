import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { spinner } from "@reliverse/rempts";
import path from "node:path";

import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

import { setupMongoDBAtlas } from "~/libs/sdk/providers/better-t-stack/helpers/database-providers/mongodb-atlas-setup";
import { setupNeonPostgres } from "~/libs/sdk/providers/better-t-stack/helpers/database-providers/neon-setup";
import { setupPrismaPostgres } from "~/libs/sdk/providers/better-t-stack/helpers/database-providers/prisma-postgres-setup";
import { setupSupabase } from "~/libs/sdk/providers/better-t-stack/helpers/database-providers/supabase-setup";
import { setupTurso } from "~/libs/sdk/providers/better-t-stack/helpers/database-providers/turso-setup";
import { addPackageDependency } from "~/libs/sdk/providers/better-t-stack/utils/add-package-deps";

export async function setupDatabase(config: ProjectConfig): Promise<void> {
  const { database, orm, dbSetup, backend, projectDir } = config;

  if (backend === "convex" || database === "none") {
    if (backend !== "convex") {
      const serverDir = path.join(projectDir, "apps/server");
      const serverDbDir = path.join(serverDir, "src/db");
      if (await fs.pathExists(serverDbDir)) {
        await fs.remove(serverDbDir);
      }
    }
    return;
  }

  const s = spinner();
  const serverDir = path.join(projectDir, "apps/server");

  if (!(await fs.pathExists(serverDir))) {
    return;
  }

  try {
    if (orm === "prisma") {
      await addPackageDependency({
        dependencies: ["@prisma/client"],
        devDependencies: ["prisma"],
        projectDir: serverDir,
      });
    } else if (orm === "drizzle") {
      if (database === "sqlite") {
        await addPackageDependency({
          dependencies: ["drizzle-orm", "@libsql/client"],
          devDependencies: ["drizzle-kit"],
          projectDir: serverDir,
        });
      } else if (database === "postgres") {
        await addPackageDependency({
          dependencies: ["drizzle-orm", "pg"],
          devDependencies: ["drizzle-kit", "@types/pg"],
          projectDir: serverDir,
        });
      } else if (database === "mysql") {
        await addPackageDependency({
          dependencies: ["drizzle-orm", "mysql2"],
          devDependencies: ["drizzle-kit"],
          projectDir: serverDir,
        });
      }
    } else if (orm === "mongoose") {
      await addPackageDependency({
        dependencies: ["mongoose"],
        devDependencies: [],
        projectDir: serverDir,
      });
    }

    if (database === "sqlite" && dbSetup === "turso") {
      await setupTurso(config);
    } else if (database === "postgres") {
      if (orm === "prisma" && dbSetup === "prisma-postgres") {
        await setupPrismaPostgres(config);
      } else if (dbSetup === "neon") {
        await setupNeonPostgres(config);
      } else if (dbSetup === "supabase") {
        await setupSupabase(config);
      }
    } else if (database === "mongodb" && dbSetup === "mongodb-atlas") {
      await setupMongoDBAtlas(config);
    }
  } catch (error) {
    s.stop(re.red("Failed to set up database"));
    if (error instanceof Error) {
      relinka("error", re.red(error.message));
    }
  }
}
