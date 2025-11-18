// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import { type AvailableDependencies, dependencyVersionMap } from "../constants";

export const addPackageDependency = async (opts: {
  dependencies?: AvailableDependencies[];
  devDependencies?: AvailableDependencies[];
  customDependencies?: Record<string, string>;
  customDevDependencies?: Record<string, string>;
  projectDir: string;
}) => {
  const {
    dependencies = [],
    devDependencies = [],
    customDependencies = {},
    customDevDependencies = {},
    projectDir,
  } = opts;

  const pkgJsonPath = path.join(projectDir, "package.json");

  const pkgJson = await readPackageJSON(path.dirname(pkgJsonPath));

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

  for (const [pkgName, version] of Object.entries(customDependencies)) {
    pkgJson.dependencies[pkgName] = version;
  }

  for (const [pkgName, version] of Object.entries(customDevDependencies)) {
    pkgJson.devDependencies[pkgName] = version;
  }

  await writePackageJSON(path.dirname(pkgJsonPath), pkgJson);
};
