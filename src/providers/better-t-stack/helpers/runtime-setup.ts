import path from "node:path";
import fs from "@reliverse/relifso";
import type { ProjectBackend, ProjectConfig } from "../types.js";
import { addPackageDependency } from "../utils/add-package-deps";

export async function setupRuntime(config: ProjectConfig): Promise<void> {
  const { projectName, runtime, backend } = config;

  if (backend === "convex" || backend === "next" || runtime === "none") {
    return;
  }

  const projectDir = path.resolve(process.cwd(), projectName);
  const serverDir = path.join(projectDir, "apps/server");

  if (!(await fs.pathExists(serverDir))) {
    return;
  }

  if (runtime === "bun") {
    await setupBunRuntime(serverDir, backend);
  } else if (runtime === "node") {
    await setupNodeRuntime(serverDir, backend);
  }
}

async function setupBunRuntime(
  serverDir: string,
  backend: ProjectBackend,
): Promise<void> {
  const packageJsonPath = path.join(serverDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;

  const packageJson = await fs.readJson(packageJsonPath);

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
  backend: ProjectBackend,
): Promise<void> {
  const packageJsonPath = path.join(serverDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;

  const packageJson = await fs.readJson(packageJsonPath);

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
