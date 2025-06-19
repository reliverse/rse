import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { cancel, isCancel, password, spinner } from "@reliverse/rempts";
import { execa } from "execa";
import path from "node:path";

import type { PackageManager } from "~/libs/sdk/providers/better-t-stack/types";

import {
  type EnvVariable,
  addEnvVariablesToFile,
} from "~/libs/sdk/providers/better-t-stack/helpers/project-generation/env-setup";
import { addPackageDependency } from "~/libs/sdk/providers/better-t-stack/utils/add-package-deps";
import { getPackageExecutionCommand } from "~/libs/sdk/providers/better-t-stack/utils/get-package-execution-command";

interface PrismaConfig {
  databaseUrl: string;
}

async function initPrismaDatabase(
  serverDir: string,
  packageManager: PackageManager,
): Promise<PrismaConfig | null> {
  const s = spinner();
  try {
    s.start("Initializing Prisma PostgreSQL...");

    const prismaDir = path.join(serverDir, "prisma");
    await fs.ensureDir(prismaDir);

    s.stop("Prisma PostgreSQL initialized. Follow the prompts below:");

    const prismaInitCommand = getPackageExecutionCommand(
      packageManager,
      "prisma init --db",
    );

    await execa(prismaInitCommand, {
      cwd: serverDir,
      stdio: "inherit",
      shell: true,
    });

    relinka(
      "info",
      re.yellow(
        "Please copy the Prisma Postgres URL from the output above.\nIt looks like: prisma+postgres://accelerate.prisma-data.net/?api_key=...",
      ),
    );

    const databaseUrl = await password({
      message: "Paste your Prisma Postgres database URL:",
      validate(value) {
        if (!value) return "Please enter a database URL";
        if (!value.startsWith("prisma+postgres://")) {
          return "URL should start with prisma+postgres://";
        }
      },
    });

    if (isCancel(databaseUrl)) {
      cancel("Database setup cancelled");
      return null;
    }

    return {
      databaseUrl: databaseUrl as string,
    };
  } catch (error) {
    s.stop(re.red("Prisma PostgreSQL initialization failed"));
    if (error instanceof Error) {
      relinka("error", error.message);
    }
    return null;
  }
}

async function writeEnvFile(projectDir: string, config?: PrismaConfig) {
  try {
    const envPath = path.join(projectDir, "apps/server", ".env");
    const variables: EnvVariable[] = [
      {
        key: "DATABASE_URL",
        value:
          config?.databaseUrl ??
          "postgresql://postgres:postgres@localhost:5432/mydb?schema=public",
        condition: true,
      },
    ];
    await addEnvVariablesToFile(envPath, variables);
  } catch (_error) {
    relinka("error", "Failed to update environment configuration");
  }
}

function displayManualSetupInstructions() {
  relinka(
    "info",
    `Manual Prisma PostgreSQL Setup Instructions:

1. Visit https://console.prisma.io and create an account
2. Create a new PostgreSQL database from the dashboard
3. Get your database URL
4. Add the database URL to the .env file in apps/server/.env

DATABASE_URL="your_database_url"`,
  );
}

async function addPrismaAccelerateExtension(serverDir: string) {
  try {
    await addPackageDependency({
      dependencies: ["@prisma/extension-accelerate"],
      projectDir: serverDir,
    });

    const prismaIndexPath = path.join(serverDir, "prisma/index.ts");
    const prismaIndexContent = `
import { PrismaClient } from "./generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;
`;
    await fs.writeFile(prismaIndexPath, prismaIndexContent.trim());

    const dbFilePath = path.join(serverDir, "src/db/index.ts");
    if (await fs.pathExists(dbFilePath)) {
      let dbFileContent = await fs.readFile(dbFilePath, "utf8");

      if (!dbFileContent.includes("@prisma/extension-accelerate")) {
        dbFileContent = `import { withAccelerate } from "@prisma/extension-accelerate";\n${dbFileContent}`;

        dbFileContent = dbFileContent.replace(
          "export const db = new PrismaClient();",
          "export const db = new PrismaClient().$extends(withAccelerate());",
        );

        await fs.writeFile(dbFilePath, dbFileContent);
      }
    }
    return true;
  } catch (_error) {
    relinka(
      "warn",
      re.yellow("Could not add Prisma Accelerate extension automatically"),
    );
    return false;
  }
}

import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

export async function setupPrismaPostgres(config: ProjectConfig) {
  const { packageManager, projectDir } = config;
  const serverDir = path.join(projectDir, "apps/server");
  const s = spinner();
  s.start("Setting up Prisma PostgreSQL...");

  try {
    await fs.ensureDir(serverDir);

    s.stop("Prisma PostgreSQL setup ready");

    const config = await initPrismaDatabase(serverDir, packageManager);

    if (config) {
      await writeEnvFile(projectDir, config);
      await addPrismaAccelerateExtension(serverDir);
      relinka(
        "success",
        re.green("Prisma PostgreSQL database configured successfully!"),
      );
      relinka(
        "info",
        re.cyan(
          'NOTE: Make sure to uncomment `import "dotenv/config";` in `apps/server/src/prisma.config.ts` to load environment variables.',
        ),
      );
    } else {
      const fallbackSpinner = spinner();
      fallbackSpinner.start("Setting up fallback configuration...");
      await writeEnvFile(projectDir);
      fallbackSpinner.stop("Fallback configuration ready");
      displayManualSetupInstructions();
    }
  } catch (error) {
    s.stop(re.red("Prisma PostgreSQL setup failed"));
    relinka(
      "error",
      re.red(
        `Error during Prisma PostgreSQL setup: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );

    try {
      await writeEnvFile(projectDir);
      displayManualSetupInstructions();
    } catch {}

    relinka("info", "Setup completed with manual configuration required.");
  }
}
