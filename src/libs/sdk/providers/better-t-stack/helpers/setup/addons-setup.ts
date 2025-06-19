import fs from "@reliverse/relifso";
import path from "node:path";

import type { Frontend } from "~/libs/sdk/providers/better-t-stack/types";
import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

import { addPackageDependency } from "~/libs/sdk/providers/better-t-stack/utils/add-package-deps";

import { setupStarlight } from "./starlight-setup";
import { setupTauri } from "./tauri-setup";

interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  packageManager?: string;
  "lint-staged"?: Record<string, string[]>;
}

export async function setupAddons(config: ProjectConfig) {
  const { addons, frontend, projectDir } = config;
  const hasReactWebFrontend =
    frontend.includes("react-router") ||
    frontend.includes("tanstack-router") ||
    frontend.includes("next");
  const hasNuxtFrontend = frontend.includes("nuxt");
  const hasSvelteFrontend = frontend.includes("svelte");
  const hasSolidFrontend = frontend.includes("solid");
  const hasNextFrontend = frontend.includes("next");

  if (addons.includes("turborepo")) {
    await addPackageDependency({
      devDependencies: ["turbo"],
      projectDir,
    });
  }

  if (addons.includes("pwa") && (hasReactWebFrontend || hasSolidFrontend)) {
    await setupPwa(projectDir, frontend);
  }
  if (
    addons.includes("tauri") &&
    (hasReactWebFrontend ||
      hasNuxtFrontend ||
      hasSvelteFrontend ||
      hasSolidFrontend ||
      hasNextFrontend)
  ) {
    await setupTauri(config);
  }
  if (addons.includes("biome")) {
    await setupBiome(projectDir);
  }
  if (addons.includes("husky")) {
    await setupHusky(projectDir);
  }
  if (addons.includes("starlight")) {
    await setupStarlight(config);
  }
}

function getWebAppDir(projectDir: string, frontends: Frontend[]): string {
  if (
    frontends.some((f) =>
      ["react-router", "tanstack-router", "nuxt", "svelte", "solid"].includes(
        f,
      ),
    )
  ) {
    return path.join(projectDir, "apps/web");
  }
  return path.join(projectDir, "apps/web");
}

async function setupBiome(projectDir: string) {
  await addPackageDependency({
    devDependencies: ["@biomejs/biome"],
    projectDir,
  });

  const packageJsonPath = path.join(projectDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

    packageJson.scripts = {
      ...packageJson.scripts,
      check: "biome check --write .",
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

async function setupHusky(projectDir: string) {
  await addPackageDependency({
    devDependencies: ["husky", "lint-staged"],
    projectDir,
  });

  const packageJsonPath = path.join(projectDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

    packageJson.scripts = {
      ...packageJson.scripts,
      prepare: "husky",
    };

    packageJson["lint-staged"] = {
      "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": [
        "biome check --write .",
      ],
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

async function setupPwa(projectDir: string, frontends: Frontend[]) {
  const isCompatibleFrontend = frontends.some((f) =>
    ["react-router", "tanstack-router", "solid"].includes(f),
  );
  if (!isCompatibleFrontend) return;

  const clientPackageDir = getWebAppDir(projectDir, frontends);

  if (!(await fs.pathExists(clientPackageDir))) {
    return;
  }

  await addPackageDependency({
    dependencies: ["vite-plugin-pwa"],
    devDependencies: ["@vite-pwa/assets-generator"],
    projectDir: clientPackageDir,
  });

  const clientPackageJsonPath = path.join(clientPackageDir, "package.json");
  if (await fs.pathExists(clientPackageJsonPath)) {
    const packageJson = (await fs.readJson(
      clientPackageJsonPath,
    )) as PackageJson;

    packageJson.scripts = {
      ...packageJson.scripts,
      "generate-pwa-assets": "pwa-assets-generator",
    };

    await fs.writeJson(clientPackageJsonPath, packageJson, { spaces: 2 });
  }
}
