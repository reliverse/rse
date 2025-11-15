// apps/rse/src/cmds/init/utils/biome.ts

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { writeJsonFile } from "@reliverse/dler-helpers";
import { logger } from "@reliverse/dler-logger";
import { hasWorkspaces, readPackageJSON } from "@reliverse/dler-pkg-tsc";
import type { BiomeConfig } from "../types";

export const findBiomeConfig = async (
  startDir: string,
): Promise<BiomeConfig> => {
  let currentDir = resolve(startDir);
  let depth = 0;
  const maxDepth = 3;

  while (depth <= maxDepth) {
    const biomePath = join(currentDir, "biome.json");

    if (existsSync(biomePath)) {
      try {
        const content = await Bun.file(biomePath).json();
        return {
          path: biomePath,
          exists: true,
          content,
        };
      } catch {
        // If we can't read the file, continue searching
      }
    }

    const parentDir = resolve(currentDir, "..");
    if (parentDir === currentDir) break;
    currentDir = parentDir;
    depth++;
  }

  // No biome.json found, determine where to create it
  const monorepoRoot = await findMonorepoRoot(startDir);
  const targetPath = monorepoRoot || startDir;

  return {
    path: join(targetPath, "biome.json"),
    exists: false,
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

export const createBiomeConfig = async (
  configPath: string,
  integrationType?: string,
): Promise<void> => {
  logger.info(`📝 Creating biome.json at ${configPath}`);

  const baseConfig = {
    $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
    extends: ["ultracite"],
    files: {
      includes: [
        "**",
        "!**/.js",
        "!**/.d.ts",
        "!**/_generated",
        "!**/.next",
        "!**/.react-email",
        "!**/.source",
        "!**/.turbo",
        "!**/.vercel",
        "!**/.wrangler",
        "!**/.zed",
        "!**/dev-dist",
        "!**/dist-*",
        "!**/dist",
        "!**/drizzle/migrations",
        "!**/node_modules",
      ],
      ignoreUnknown: false,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
        // Add integration-specific rules if needed
        ...(integrationType === "nextjs" && {
          a11y: {
            useHtmlLang: "warn",
            noHeaderScope: "warn",
          },
        }),
      },
    },
    formatter: {
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
      lineWidth: 80,
    },
    javascript: {
      globals: ["Bun"],
      formatter: {
        enabled: true,
        lineEnding: "lf",
        jsxQuoteStyle: "double",
        quoteProperties: "asNeeded",
        trailingCommas: "all",
        lineWidth: 80,
        indentWidth: 2,
        indentStyle: "space",
        semicolons: "always",
        arrowParentheses: "always",
        bracketSpacing: true,
        bracketSameLine: false,
        quoteStyle: "double",
        attributePosition: "auto",
      },
    },
    assist: {
      enabled: true,
      actions: {
        source: {
          organizeImports: "on",
        },
      },
    },
    vcs: {
      enabled: false,
      clientKind: "git",
      useIgnoreFile: false,
    },
  };

  await writeJsonFile(configPath, baseConfig);
};

export const updateBiomeConfig = async (
  configPath: string,
  content: any,
): Promise<void> => {
  logger.info(`📝 Updating biome.json at ${configPath}`);

  // Ensure ultracite is in extends array
  if (!content.extends || !Array.isArray(content.extends)) {
    content.extends = [];
  }

  if (!content.extends.includes("ultracite")) {
    content.extends.unshift("ultracite");
  }

  await writeJsonFile(configPath, content);
};
