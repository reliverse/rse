import fs from "@reliverse/relifso";
import path from "node:path";

import {
  type AvailableDependencies,
  dependencyVersionMap,
} from "~/libs/sdk/providers/better-t-stack/constants";

export const addPackageDependency = async (opts: {
  dependencies?: AvailableDependencies[];
  devDependencies?: AvailableDependencies[];
  projectDir: string;
}): Promise<void> => {
  const { dependencies = [], devDependencies = [], projectDir } = opts;

  const pkgJsonPath = path.join(projectDir, "package.json");

  const pkgJson = (await fs.readJson(pkgJsonPath)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

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
