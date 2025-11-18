// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/helpers/deployment/server-deploy-setup.ts

import { re } from "@reliverse/dler-colors";
import fs from "@reliverse/dler-fs-utils";
import { logger } from "@reliverse/dler-logger";
import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import { createSpinner } from "@reliverse/dler-spinner";
import { execa } from "execa";
import type { PackageManager, ProjectConfig } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";
import { getPackageExecutionCommand } from "../../utils/package-runner";

export async function setupServerDeploy(config: ProjectConfig) {
  const { serverDeploy, webDeploy, projectDir } = config;
  const { packageManager } = config;

  if (serverDeploy === "none") return;

  if (serverDeploy === "alchemy" && webDeploy === "alchemy") {
    return;
  }

  const serverDir = path.join(projectDir, "apps/server");
  if (!(await fs.pathExists(serverDir))) return;

  if (serverDeploy === "wrangler") {
    await setupWorkersServerDeploy(serverDir, packageManager);
    await generateCloudflareWorkerTypes({ serverDir, packageManager });
  } else if (serverDeploy === "alchemy") {
    await setupAlchemyServerDeploy(serverDir, packageManager, projectDir);
  }
}

async function setupWorkersServerDeploy(
  serverDir: string,
  _packageManager: PackageManager,
) {
  const packageJsonPath = path.join(serverDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;

  const packageJson = await readPackageJSON(path.dirname(packageJsonPath));

  packageJson.scripts = {
    ...packageJson.scripts,
    dev: "wrangler dev --port=3000",
    start: "wrangler dev",
    deploy: "wrangler deploy",
    build: "wrangler deploy --dry-run",
    "cf-typegen": "wrangler types --env-interface CloudflareBindings",
  };

  await writePackageJSON(path.dirname(packageJsonPath), packageJson);

  await addPackageDependency({
    devDependencies: ["wrangler", "@types/node"],
    projectDir: serverDir,
  });
}

async function generateCloudflareWorkerTypes({
  serverDir,
  packageManager,
}: {
  serverDir: string;
  packageManager: ProjectConfig["packageManager"];
}) {
  if (!(await fs.pathExists(serverDir))) return;
  const s = createSpinner();
  try {
    s.start("Generating Cloudflare Workers types...");
    const runCmd = getPackageExecutionCommand(
      packageManager,
      "wrangler types --env-interface CloudflareBindings",
    );
    await execa(runCmd, { cwd: serverDir, shell: true });
    s.stop("Cloudflare Workers types generated successfully!");
  } catch {
    s.stop(re.yellow("Failed to generate Cloudflare Workers types"));
    const managerCmd = `${packageManager} run`;
    logger.warn(
      `Note: You can manually run 'cd apps/server && ${managerCmd} cf-typegen' in the project directory later`,
    );
  }
}

export async function setupAlchemyServerDeploy(
  serverDir: string,
  _packageManager: PackageManager,
  projectDir?: string,
) {
  if (!(await fs.pathExists(serverDir))) return;

  await addPackageDependency({
    devDependencies: [
      "alchemy",
      "wrangler",
      "@types/node",
      "@cloudflare/workers-types",
    ],
    projectDir: serverDir,
  });

  if (projectDir) {
    await addAlchemyPackagesDependencies(projectDir);
  }

  const packageJsonPath = path.join(serverDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await readPackageJSON(path.dirname(packageJsonPath));

    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "alchemy dev",
      deploy: "alchemy deploy",
      destroy: "alchemy destroy",
    };

    await writePackageJSON(path.dirname(packageJsonPath), packageJson);
  }
}

async function addAlchemyPackagesDependencies(projectDir: string) {
  await addPackageDependency({
    devDependencies: ["@cloudflare/workers-types"],
    projectDir,
  });
}
