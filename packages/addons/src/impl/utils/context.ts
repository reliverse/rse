// apps/rse/src/cmds/init/utils/context.ts

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { logger } from "@reliverse/dler-logger";
import {
  getWorkspacePatterns,
  hasWorkspaces,
  readPackageJSON,
} from "@reliverse/dler-pkg-tsc";
import { askQuestion } from "@reliverse/dler-prompt";
import type { DetectedPackageInfo, ProjectContext } from "../types";

export const detectProjectContext = async (
  cwd?: string,
): Promise<ProjectContext> => {
  const startDir = resolve(cwd ?? process.cwd());
  const monorepoRoot = await findMonorepoRoot(startDir);

  if (monorepoRoot) {
    logger.info("🔍 Detected monorepo project");
    const packages = await getWorkspacePackages(monorepoRoot);

    return {
      type: "monorepo",
      rootPath: monorepoRoot,
      targetPath: monorepoRoot, // Will be updated when package is selected
      packages,
    };
  }

  logger.info("🔍 Detected standalone project");
  return {
    type: "single-repo",
    rootPath: startDir,
    targetPath: startDir,
  };
};

const findMonorepoRoot = async (startDir: string): Promise<string | null> => {
  let currentDir = resolve(startDir);

  while (currentDir !== "/") {
    const pkgPath = join(currentDir, "package.json");

    if (existsSync(pkgPath)) {
      const pkg = await readPackageJSON(currentDir);

      if (pkg && hasWorkspaces(pkg)) {
        return currentDir;
      }
    }

    const parentDir = resolve(currentDir, "..");
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return null;
};

const getWorkspacePackages = async (
  monorepoRoot: string,
): Promise<DetectedPackageInfo[]> => {
  const rootPkg = await readPackageJSON(monorepoRoot);
  if (!rootPkg) {
    throw new Error("❌ Could not read root package.json");
  }

  const patterns = getWorkspacePatterns(rootPkg);
  if (!patterns.length) {
    throw new Error("❌ No workspace patterns found in package.json");
  }

  const packages: DetectedPackageInfo[] = [];
  const seenPaths = new Set<string>();

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern);
    const matches = glob.scanSync({ cwd: monorepoRoot, onlyFiles: false });

    for (const match of matches) {
      const packagePath = resolve(monorepoRoot, match);

      if (seenPaths.has(packagePath)) continue;
      seenPaths.add(packagePath);

      const pkgInfo = await resolvePackageInfo(packagePath);
      if (pkgInfo) {
        packages.push(pkgInfo);
      }
    }
  }

  // Don't filter out root - it's now a valid target
  return packages;
};

const resolvePackageInfo = async (
  packagePath: string,
): Promise<DetectedPackageInfo | null> => {
  try {
    const packageJsonPath = join(packagePath, "package.json");
    if (!existsSync(packageJsonPath)) return null;

    const packageJson = await readPackageJSON(packagePath);
    if (!packageJson || !packageJson.name) return null;

    return {
      name: packageJson.name,
      path: packagePath,
      packageJson,
    };
  } catch {
    return null;
  }
};

export const selectTargetPackage = async (
  packages: DetectedPackageInfo[],
): Promise<DetectedPackageInfo> => {
  if (packages.length === 0) {
    throw new Error("❌ No packages found in workspace");
  }

  if (packages.length === 1) {
    logger.info(`📦 Using package: ${packages[0]?.name}`);
    return packages[0]!;
  }

  logger.info("\n📦 Available packages:");
  packages.forEach((pkg, index) => {
    logger.log(`  ${index + 1}. ${pkg.name}`);
  });

  while (true) {
    const answer = await askQuestion(
      `Select target package (1-${packages.length})`,
      "1",
    );

    const index = Number.parseInt(answer, 10) - 1;
    if (index >= 0 && index < packages.length) {
      return packages[index]!;
    }

    logger.error("❌ Invalid selection. Please try again.");
  }
};

// Detect packages from a newly created monorepo
export const detectCreatedPackages = async (
  monorepoRoot: string,
): Promise<DetectedPackageInfo[]> => {
  return getWorkspacePackages(monorepoRoot);
};
