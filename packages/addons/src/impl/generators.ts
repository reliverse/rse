import { writeJsonFile, writeTextFile } from "@reliverse/dler-helpers";
import { logger } from "@reliverse/dler-logger";
import {
  DEFAULT_CATALOG,
  ROOT_FILES,
  TSCONFIG_PRESETS,
  WORKSPACES,
} from "./config";
import type { MonorepoConfig, PackageInfo } from "./types";
import {
  createFullPath,
  ensureDir,
  fileExists,
  getWorkspaceScope,
} from "./utils";

export const generateRootPackageJson = async (
  config: MonorepoConfig,
): Promise<void> => {
  const packageJsonPath = createFullPath(config.rootPath, "package.json");
  const alreadyExists = await fileExists(packageJsonPath);

  if (alreadyExists) {
    logger.info("📝 Updating existing root package.json...");
    const existingContent = await Bun.file(packageJsonPath).json();

    const workspaces = new Set<string>([
      ...(existingContent.workspaces?.packages || []),
      ...getWorkspacePatterns(config),
    ]);

    const catalog = {
      ...(existingContent.workspaces?.catalog || {}),
      ...Object.fromEntries(
        DEFAULT_CATALOG.map((dep) => [dep.name, dep.version]),
      ),
    };

    const updatedPackageJson = {
      ...existingContent,
      // Persist core metadata from current config (overwrite with user's latest answers)
      name: config.name,
      version: config.version,
      description: config.description,
      ...(config.author && { author: config.author }),
      ...(config.license && { license: config.license }),
      workspaces: {
        ...existingContent.workspaces,
        packages: Array.from(workspaces).sort(),
        catalog,
      },
    };

    await writeJsonFile(packageJsonPath, updatedPackageJson);
  } else {
    logger.info("📝 Creating root package.json...");
    const packageJson = {
      name: config.name,
      version: config.version,
      description: config.description,
      private: true,
      workspaces: {
        packages: getWorkspacePatterns(config),
        catalog: Object.fromEntries(
          DEFAULT_CATALOG.map((dep) => [dep.name, dep.version]),
        ),
      },
      scripts: {
        check: "bun typecheck && bun lint && bun format",
        typecheck: "tsc --noEmit",
        lint: "biome check .",
        "lint:fix": "biome check --write .",
        format: "biome format --write .",
      },
      devDependencies: {
        "@biomejs/biome": "catalog:",
        typescript: "catalog:",
        "@types/bun": "catalog:",
      },
      ...(config.author && { author: config.author }),
      ...(config.license && { license: config.license }),
    };

    await writeJsonFile(packageJsonPath, packageJson);
  }
};

const getWorkspacePatterns = (config: MonorepoConfig): string[] => {
  const patterns = new Set<string>();

  for (const pkg of config.packages) {
    patterns.add(`${pkg.workspace}/*`);
  }

  return Array.from(patterns).sort();
};

export const generateRootFiles = async (
  config: MonorepoConfig,
): Promise<void> => {
  logger.info("📄 Creating root files...");

  const gitignorePath = createFullPath(config.rootPath, ".gitignore");
  if (!(await fileExists(gitignorePath))) {
    await writeTextFile(gitignorePath, ROOT_FILES.GITIGNORE);
  }

  const readmePath = createFullPath(config.rootPath, "README.md");
  if (!(await fileExists(readmePath))) {
    await writeTextFile(readmePath, ROOT_FILES.README(config.name));
  }
};

export const generateTsconfigPackage = async (
  config: MonorepoConfig,
): Promise<void> => {
  logger.info("📦 Creating tsconfig package...");

  const tsconfigPath = createFullPath(config.rootPath, WORKSPACES.TSCONFIG);
  await ensureDir(tsconfigPath);

  const packageJsonPath = createFullPath(tsconfigPath, "package.json");
  if (!(await fileExists(packageJsonPath))) {
    const scope = getWorkspaceScope(WORKSPACES.PACKAGES);
    const packageJson = {
      name: `${scope}tsconfig`,
      version: "0.0.0",
      private: true,
      description: "Shared TypeScript configuration",
    };

    await writeJsonFile(packageJsonPath, packageJson);
  }

  for (const [name, content] of Object.entries(TSCONFIG_PRESETS)) {
    const presetPath = createFullPath(tsconfigPath, `${name}.json`);
    if (!(await fileExists(presetPath))) {
      await writeJsonFile(presetPath, content);
    }
  }
};

export const generatePackage = async (
  config: MonorepoConfig,
  pkg: PackageInfo,
): Promise<void> => {
  const packagePath = createFullPath(config.rootPath, pkg.workspace, pkg.name);

  logger.info(`📦 Creating package ${pkg.scope}${pkg.name}...`);

  await ensureDir(packagePath);

  const packageJsonPath = createFullPath(packagePath, "package.json");
  if (!(await fileExists(packageJsonPath))) {
    const tsconfigScope = getWorkspaceScope(WORKSPACES.PACKAGES);
    const packageJson = {
      name: `${pkg.scope}${pkg.name}`,
      version: "0.1.0",
      private: true,
      type: "module",
      exports: {
        ".": {
          types: "./src/mod.ts",
          default: "./src/mod.ts",
        },
      },
      scripts: {
        dev: "bun src/mod.ts",
      },
      devDependencies: {
        [`${tsconfigScope}tsconfig`]: "workspace:*",
        typescript: "catalog:",
        "@types/bun": "catalog:",
      },
    };

    await writeJsonFile(packageJsonPath, packageJson);
  }

  const tsconfigPath = createFullPath(packagePath, "tsconfig.json");
  if (!(await fileExists(tsconfigPath))) {
    const tsconfigScope = getWorkspaceScope(WORKSPACES.PACKAGES);
    const tsconfig = {
      extends: `${tsconfigScope}tsconfig/strict.json`,
      compilerOptions: {
        rootDir: ".",
        outDir: "./dist",
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    };

    await writeJsonFile(tsconfigPath, tsconfig);
  }

  const srcPath = createFullPath(packagePath, "src");
  await ensureDir(srcPath);

  const indexPath = createFullPath(srcPath, "index.ts");
  if (!(await fileExists(indexPath))) {
    const indexContent = `export const hello = (): string => {
  return "Hello from ${pkg.scope}${pkg.name}!";
};

console.log(hello());
`;

    await writeTextFile(indexPath, indexContent);
  }
};

export const generateAllPackages = async (
  config: MonorepoConfig,
): Promise<void> => {
  await generateTsconfigPackage(config);

  for (const pkg of config.packages) {
    await generatePackage(config, pkg);
  }
};
