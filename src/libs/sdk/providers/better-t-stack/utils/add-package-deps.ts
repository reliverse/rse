import fs from "@reliverse/relifso";
import path from "node:path";

import {
  type AvailableDependencies,
  dependencyVersionMap,
} from "~/libs/sdk/providers/better-t-stack/constants";

interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  packageManager?: string;
  "lint-staged"?: Record<string, string[]>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export const addPackageDependency = async (opts: {
  dependencies?: AvailableDependencies[];
  devDependencies?: AvailableDependencies[];
  projectDir: string;
}): Promise<void> => {
  const { dependencies = [], devDependencies = [], projectDir } = opts;

  const pkgJsonPath = path.join(projectDir, "package.json");

  const pkgJson = (await fs.readJson(pkgJsonPath)) as PackageJson;

  if (!pkgJson.dependencies) pkgJson.dependencies = {};
  if (!pkgJson.devDependencies) pkgJson.devDependencies = {};

  for (const pkgName of dependencies) {
    const version = dependencyVersionMap[pkgName];
    if (version) {
      pkgJson.dependencies[pkgName] = version;
    } else {
      console.warn(`Warning: Dependency ${pkgName} not found in version map.`);
    }
  }

  for (const pkgName of devDependencies) {
    const version = dependencyVersionMap[pkgName];
    if (version) {
      pkgJson.devDependencies[pkgName] = version;
    } else {
      console.warn(
        `Warning: Dev dependency ${pkgName} not found in version map.`,
      );
    }
  }

  await fs.writeJson(pkgJsonPath, pkgJson, {
    spaces: 2,
  });
};
