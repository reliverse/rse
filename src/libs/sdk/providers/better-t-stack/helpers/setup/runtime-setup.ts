import fs from "@reliverse/relifso";
import path from "node:path";

import type {
  Backend,
  ProjectConfig,
} from "~/libs/sdk/providers/better-t-stack/types";

import { addPackageDependency } from "~/libs/sdk/providers/better-t-stack/utils/add-package-deps";

interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  packageManager?: string;
  "lint-staged"?: Record<string, string[]>;
}

export async function setupRuntime(config: ProjectConfig): Promise<void> {
  const { runtime, backend, projectDir } = config;

  if (backend === "convex" || backend === "next" || runtime === "none") {
    return;
  }

  const serverDir = path.join(projectDir, "apps/server");

  if (!(await fs.pathExists(serverDir))) {
    return;
  }

  if (runtime === "bun") {
    await setupBunRuntime(serverDir, backend);
  } else if (runtime === "node") {
    await setupNodeRuntime(serverDir, backend);
  } else if (runtime === "workers") {
    await setupWorkersRuntime(serverDir);
  }
}

async function setupBunRuntime(
  serverDir: string,
  _backend: Backend,
): Promise<void> {
  const packageJsonPath = path.join(serverDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;

  const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

  packageJson.scripts = {
    ...packageJson.scripts,
    dev: "bun run --hot src/index.ts",
    start: "bun run dist/src/index.js",
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  await addPackageDependency({
    devDependencies: ["@types/bun"],
    projectDir: serverDir,
  });
}

async function setupNodeRuntime(
  serverDir: string,
  backend: Backend,
): Promise<void> {
  const packageJsonPath = path.join(serverDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;

  const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

  packageJson.scripts = {
    ...packageJson.scripts,
    dev: "tsx watch src/index.ts",
    start: "node dist/src/index.js",
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  await addPackageDependency({
    devDependencies: ["tsx", "@types/node"],
    projectDir: serverDir,
  });

  if (backend === "hono") {
    await addPackageDependency({
      dependencies: ["@hono/node-server"],
      projectDir: serverDir,
    });
  } else if (backend === "elysia") {
    await addPackageDependency({
      dependencies: ["@elysiajs/node"],
      projectDir: serverDir,
    });
  }
}

async function setupWorkersRuntime(serverDir: string): Promise<void> {
  const packageJsonPath = path.join(serverDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;

  const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

  packageJson.scripts = {
    ...packageJson.scripts,
    dev: "wrangler dev --port=3000",
    start: "wrangler dev",
    deploy: "wrangler deploy",
    build: "wrangler deploy --dry-run",
    "cf-typegen": "wrangler types --env-interface CloudflareBindings",
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  await addPackageDependency({
    devDependencies: ["wrangler"],
    projectDir: serverDir,
  });
}
