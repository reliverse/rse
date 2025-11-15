import { existsSync, rmSync, unlinkSync } from "node:fs";
import {
  exists,
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import { escapeTemplateFiles } from "@reliverse/rse-escaper";
import { $ } from "bun";

const REPO_URL = "https://github.com/AmanVarshney01/create-better-t-stack";
const REPO_NAME = "create-better-t-stack";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getCacheDirectory(): string {
  return join(homedir(), ".reliverse", "dler", "cache", "bts");
}

function getCacheTimestampPath(): string {
  return join(getCacheDirectory(), ".timestamp");
}

function getCachedRepoPath(): string {
  return join(getCacheDirectory(), REPO_NAME);
}

async function isCacheValid(): Promise<boolean> {
  const cachedRepo = getCachedRepoPath();
  const timestampPath = getCacheTimestampPath();

  // Check if cache exists
  const cacheExists = await exists(cachedRepo);
  const timestampExists = await exists(timestampPath);

  if (!cacheExists || !timestampExists) {
    return false;
  }

  // Check if timestamp is valid
  try {
    const timestampContent = await readFile(timestampPath, "utf-8");
    const lastDownloadTime = Number.parseInt(timestampContent.trim(), 10);

    if (Number.isNaN(lastDownloadTime)) {
      return false;
    }

    const now = Date.now();
    const age = now - lastDownloadTime;

    return age < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

async function updateCacheTimestamp(): Promise<void> {
  const cacheDir = getCacheDirectory();
  const timestampPath = getCacheTimestampPath();

  await mkdir(cacheDir, { recursive: true });
  await writeFile(timestampPath, Date.now().toString(), "utf-8");
}

async function copyDirectoryRecursive(
  src: string,
  dest: string,
): Promise<void> {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      const content = await Bun.file(srcPath).arrayBuffer();
      await Bun.write(destPath, content);
    }
  }
}

async function cloneOrUseCache(targetPath: string): Promise<void> {
  const cacheDir = getCacheDirectory();
  const cachedRepo = getCachedRepoPath();
  const isValid = await isCacheValid();

  // Ensure target parent directory exists
  const targetParent = dirname(targetPath);
  await mkdir(targetParent, { recursive: true });

  if (isValid) {
    logger.info("📦 Using cached repository...");
    // Copy from cache to target
    await copyDirectoryRecursive(cachedRepo, targetPath);
    logger.success("✅ Copied from cache");
  } else {
    if (await exists(cachedRepo)) {
      logger.info("🔄 Cache expired, re-downloading repository...");
      rmSync(cachedRepo, { recursive: true, force: true });
    } else {
      logger.info(`📥 Cloning ${REPO_URL}...`);
    }

    // Clone to cache first
    await mkdir(cacheDir, { recursive: true });
    await $`git clone ${REPO_URL} ${cachedRepo}`.quiet();
    await updateCacheTimestamp();
    logger.success("✅ Repository cloned successfully");

    // Copy from cache to target
    await copyDirectoryRecursive(cachedRepo, targetPath);
  }
}

async function createTempDirectory(): Promise<string> {
  const timestamp = Date.now();
  const tempPath = join(
    homedir(),
    ".reliverse",
    "dler",
    "temp",
    "bts",
    timestamp.toString(),
  );

  const dirExists = await exists(tempPath);
  if (!dirExists) {
    await mkdir(tempPath, { recursive: true });
  }

  logger.debug(`📁 Created temp directory: ${tempPath}`);
  return tempPath;
}

async function cleanupTempDirectory(tempPath: string): Promise<void> {
  try {
    if (existsSync(tempPath)) {
      rmSync(tempPath, { recursive: true, force: true });
      logger.debug(`🧹 Cleaned up temp directory: ${tempPath}`);
    }
  } catch (error) {
    logger.warn(`⚠️ Failed to clean up temp directory: ${error}`);
  }
}

async function processIndexFile(
  indexPath: string,
  modPath: string,
): Promise<string> {
  const content = await readFile(indexPath, "utf-8");
  const lines = content.split("\n");

  // Extract all imports (handle multi-line imports)
  const importBlocks: string[] = [];
  let inImport = false;
  let currentImport = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Stop at router definition
    if (line.includes("export const router")) {
      if (inImport && currentImport.trim()) {
        importBlocks.push(currentImport.trim());
      }
      break;
    }

    // Start of import
    if (line.trim().startsWith("import ")) {
      if (inImport && currentImport.trim()) {
        importBlocks.push(currentImport.trim());
      }
      currentImport = line;
      inImport = true;
    } else if (inImport) {
      // Continuation of import
      currentImport += `\n${line}`;
      // End of import (semicolon on its own line or at end)
      if (line.trim().endsWith(";")) {
        importBlocks.push(currentImport.trim());
        currentImport = "";
        inImport = false;
      }
    }
  }

  // Find init function
  let initFunctionStart = -1;
  let initFunctionEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.includes("export async function init(")) {
      initFunctionStart = i;
      // Find the end of the function by counting braces
      let braceCount = 0;
      let foundOpening = false;
      for (let j = i; j < lines.length; j++) {
        const funcLine = lines[j];
        if (!funcLine) continue;
        for (const char of funcLine) {
          if (char === "{") {
            braceCount++;
            foundOpening = true;
          }
          if (char === "}") {
            braceCount--;
            if (foundOpening && braceCount === 0) {
              initFunctionEnd = j;
              break;
            }
          }
        }
        if (initFunctionEnd >= 0) break;
      }
      break;
    }
  }

  // Find type exports
  let typeExportsStart = -1;
  let typeExportsEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.includes("export type {")) {
      typeExportsStart = i;
      // Find the closing };
      for (let j = i; j < lines.length; j++) {
        const exportLine = lines[j];
        if (exportLine?.includes("};")) {
          typeExportsEnd = j;
          break;
        }
      }
      break;
    }
  }

  // Extract the init function and modify it to work without router
  let extractedInitFunction = "";
  if (initFunctionStart >= 0 && initFunctionEnd >= 0) {
    const initFunctionLines = lines.slice(
      initFunctionStart,
      initFunctionEnd + 1,
    );
    let funcContent = initFunctionLines.join("\n");

    // Replace the caller-based implementation with direct call to createProjectHandler
    const callerPattern =
      /const caller = createRouterClient\(router, \{ context: \{\} \}\);[\s\S]*?return result as InitResult;/;
    const replacement = `  const opts = (options ?? {}) as CreateInput;
  const combinedInput = {
    projectName,
    ...opts,
    verbose: true,
  };
  const result = await createProjectHandler(combinedInput);
  return result as InitResult;`;

    funcContent = funcContent.replace(callerPattern, replacement);

    // Remove BTS_PROGRAMMATIC env var handling
    funcContent = funcContent.replace(
      /const prev = process\.env\.BTS_PROGRAMMATIC;[\s\S]*?else process\.env\.BTS_PROGRAMMATIC = prev;/g,
      "",
    );

    // Clean up any extra whitespace
    funcContent = funcContent.replace(/\n\n\n+/g, "\n\n").trim();

    extractedInitFunction = funcContent;
  }

  // Extract type exports
  let extractedTypeExports = "";
  if (typeExportsStart >= 0 && typeExportsEnd >= 0) {
    extractedTypeExports = lines
      .slice(typeExportsStart, typeExportsEnd + 1)
      .join("\n");
  }

  // Filter and transform imports
  // Remove CLI-specific imports and transform paths to relative
  const neededImports: string[] = [];
  const typeImports: string[] = [];

  for (const importBlock of importBlocks) {
    // Skip CLI-specific imports
    if (
      importBlock.includes("createRouterClient") ||
      importBlock.includes("createCli") ||
      importBlock.includes("trpc-cli") ||
      importBlock.includes("@orpc/server") ||
      importBlock.includes("@clack/prompts") ||
      importBlock.includes("picocolors") ||
      importBlock.includes("intro") ||
      importBlock.includes("log") ||
      importBlock.includes("outro") ||
      importBlock.includes("renderTitle") ||
      importBlock.includes("displaySponsors") ||
      importBlock.includes("fetchSponsors") ||
      importBlock.includes("openUrl") ||
      importBlock.includes("getLatestCLIVersion") ||
      importBlock.includes("handleError")
    ) {
      continue;
    }

    // Transform import paths to relative paths
    let transformedImport = importBlock;

    // Transform helpers/core/command-handlers imports
    if (importBlock.includes("createProjectHandler")) {
      transformedImport = `import { createProjectHandler } from "./impl/helpers/core/command-handlers";`;
      if (!neededImports.includes(transformedImport)) {
        neededImports.push(transformedImport);
      }
      continue;
    }

    // Transform types imports
    if (
      importBlock.includes("type") &&
      (importBlock.includes("CreateInput") ||
        importBlock.includes("InitResult") ||
        importBlock.includes("Database") ||
        importBlock.includes("ORM"))
    ) {
      // Extract type names from the import
      const typeMatch = importBlock.match(/type\s+{([^}]+)}/);
      if (typeMatch?.[1]) {
        const types = typeMatch[1]
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t && !t.startsWith("//"));
        if (types.length > 0) {
          const sortedTypes = types.sort();
          typeImports.push(
            `import type {\n  ${sortedTypes.join(",\n  ")}\n} from "./impl/types";`,
          );
        }
      }
      continue;
    }

    // Keep other imports that might be needed
    if (
      !importBlock.includes("from") ||
      importBlock.includes("zod") ||
      importBlock.includes("./helpers") ||
      importBlock.includes("./types") ||
      importBlock.includes("./utils")
    ) {
      // Transform relative paths
      transformedImport = transformedImport.replace(
        /from\s+["']\.\/helpers\//g,
        'from "./impl/helpers/',
      );
      transformedImport = transformedImport.replace(
        /from\s+["']\.\/types["']/g,
        'from "./impl/types"',
      );
      transformedImport = transformedImport.replace(
        /from\s+["']\.\/utils\//g,
        'from "./impl/utils/',
      );

      if (!neededImports.includes(transformedImport)) {
        neededImports.push(transformedImport);
      }
    }
  }

  // Build mod.ts content with proper structure
  const modImports: string[] = [];

  // Add createProjectHandler import
  modImports.push(
    'import { createProjectHandler } from "./impl/helpers/core/command-handlers";',
  );

  // Add type imports (consolidate all types into one import)
  if (typeExportsStart >= 0 && typeExportsEnd >= 0) {
    const typeExportBlock = lines
      .slice(typeExportsStart, typeExportsEnd + 1)
      .join("\n");
    const typeNamesMatch = typeExportBlock.match(/export type {\s*([^}]+)\s*}/);
    if (typeNamesMatch?.[1]) {
      const allTypes = typeNamesMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t)
        .sort();
      if (allTypes.length > 0) {
        modImports.push(
          `import type {\n  ${allTypes.join(",\n  ")}\n} from "./impl/types";`,
        );
      }
    }
  }

  // Build the mod.ts content
  const modContent = `${modImports.join("\n\n")}

${extractedInitFunction}

${extractedTypeExports}
`;

  // Write mod.ts (overwrite if exists)
  const modDir = dirname(modPath);
  await mkdir(modDir, { recursive: true });
  await writeFile(modPath, modContent, "utf-8");
  logger.success(`✅ Created ${modPath}`);

  // Delete index.ts
  if (existsSync(indexPath)) {
    unlinkSync(indexPath);
    logger.debug(`🗑️  Removed ${indexPath}`);
  }

  // Delete cli.ts (it depends on index.ts which we just removed)
  const cliPath = join(dirname(indexPath), "cli.ts");
  if (existsSync(cliPath)) {
    unlinkSync(cliPath);
    logger.debug(`🗑️  Removed ${cliPath}`);
  }

  return extractedInitFunction;
}

async function regenerateInitCommand(initCmdPath: string): Promise<void> {
  const generatorPath = "scripts/src/cmds/bts/cmd.ts";
  let currentInitContent = "";
  try {
    currentInitContent = await readFile(initCmdPath, "utf-8");
  } catch {
    // File doesn't exist yet, use default imports
    currentInitContent = `import { defineArgs, defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import {
  generateAllPackages,
  generateRootFiles,
  generateRootPackageJson,
  promptMonorepoConfig,
} from "@reliverse/rse-addons";
import { $ } from "bun";`;
  }

  // Extract imports properly (handle multi-line imports)
  const lines = currentInitContent.split("\n");
  const importLines: string[] = [];
  let inImport = false;
  let currentImport = "";

  for (const line of lines) {
    if (line.trim().startsWith("import ")) {
      if (inImport) {
        // Previous import was incomplete, skip it
        currentImport = "";
      }
      currentImport = line;
      inImport = true;
    } else if (inImport) {
      currentImport += `\n${line}`;
      if (line.trim().endsWith(";")) {
        // Complete import statement
        if (currentImport.includes("from")) {
          importLines.push(currentImport);
        }
        currentImport = "";
        inImport = false;
      }
    } else if (line.trim() === "" || line.trim().startsWith("//")) {
    } else {
      // Non-import line, stop collecting imports
      break;
    }
  }

  // Validate imports - if we have broken imports, use defaults
  const validImports = importLines.filter(
    (imp) => imp.includes("from") && imp.trim().endsWith(";"),
  );

  // If we don't have the required imports, use defaults
  const hasRseAddons = validImports.some((imp) =>
    imp.includes("@reliverse/rse-addons"),
  );
  const hasDlerLauncher = validImports.some((imp) =>
    imp.includes("@reliverse/dler-launcher"),
  );
  const hasDlerLogger = validImports.some((imp) =>
    imp.includes("@reliverse/dler-logger"),
  );
  const hasBun = validImports.some((imp) => imp.includes('from "bun"'));

  if (!hasRseAddons || !hasDlerLauncher || !hasDlerLogger || !hasBun) {
    // Use default imports
    validImports.length = 0;
    validImports.push(
      'import { defineArgs, defineCommand } from "@reliverse/dler-launcher";',
      'import { logger } from "@reliverse/dler-logger";',
      `import {
  generateAllPackages,
  generateRootFiles,
  generateRootPackageJson,
  promptMonorepoConfig,
} from "@reliverse/rse-addons";`,
      'import { $ } from "bun";',
    );
  }

  // Filter out the btsInit import if it already exists
  const filteredImports = validImports.filter(
    (imp) => !imp.includes("@reliverse/rse-rebts"),
  );

  // Build new command content
  const newContent = `// This file is autogenerated by: ${generatorPath}
// Do not edit manually - your changes will be overwritten

${filteredImports.join("\n")}
import { init as btsInit } from "@reliverse/rse-rebts";

export default defineCommand({
  meta: {
    name: "init",
    description:
      "Initialize a new Better-T-Stack project, optionally with RSE monorepo structure",
    examples: [
      "rse init --bts",
      "rse init --bts my-project",
      "rse init --bts --yes",
      "rse init --bts --backend hono --database sqlite --orm drizzle",
      "rse init --bts --frontend next --backend hono --yes",
      "rse init --init-monorepo",
      "",
      "# Better-T-Stack options (requires --bts):",
      "# --bts: Initialize Better-T-Stack project (required for Better-T-Stack setup)",
      "# --name: Project name",
      "# --yes: Use default configuration",
      "# --backend: Backend framework (hono, express, fastify, elysia, convex, self, none)",
      "# --frontend: Frontend framework(s), comma-separated",
      "# --database: Database type (none, sqlite, postgres, mysql, mongodb)",
      "# --orm: ORM type (drizzle, prisma, mongoose, none)",
      "# --auth: Authentication provider",
      "# --runtime: Runtime (bun, node, workers, none)",
      "# --packageManager: Package manager (npm, pnpm, yarn, bun)",
      "# --install: Install dependencies after creation",
      "",
      "# RSE options:",
      "# --init-monorepo: Initialize RSE monorepo structure (mutually exclusive with --bts)",
    ],
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "Project name (Better-T-Stack project directory name)",
    },
    yes: {
      type: "boolean",
      description: "Use default configuration",
    },
    yolo: {
      type: "boolean",
      description:
        "(WARNING - NOT RECOMMENDED) Bypass validations and compatibility checks",
    },
    verbose: {
      type: "boolean",
      description: "Show detailed result information",
    },
    database: {
      type: "string",
      description: "Database type (none, sqlite, postgres, mysql, mongodb)",
    },
    orm: {
      type: "string",
      description: "ORM type (drizzle, prisma, mongoose, none)",
    },
    auth: {
      type: "string",
      description: "Authentication provider",
    },
    payments: {
      type: "string",
      description: "Payments provider",
    },
    frontend: {
      type: "string",
      description:
        "Frontend framework(s), comma-separated (tanstack-router, react-router, tanstack-start, next, nuxt, native-bare, native-uniwind, native-unistyles, svelte, solid, none)",
    },
    addons: {
      type: "string",
      description:
        "Addon(s), comma-separated (pwa, tauri, starlight, biome, husky, ruler, turborepo, fumadocs, ultracite)",
    },
    examples: {
      type: "string",
      description: "Example(s), comma-separated",
    },
    git: {
      type: "boolean",
      description: "Initialize git repository",
    },
    packageManager: {
      type: "string",
      description: "Package manager (npm, pnpm, yarn, bun)",
    },
    install: {
      type: "boolean",
      description: "Install dependencies after creation",
    },
    dbSetup: {
      type: "string",
      description: "Database setup method",
    },
    backend: {
      type: "string",
      description:
        "Backend framework (hono, express, fastify, elysia, convex, self, none)",
    },
    runtime: {
      type: "string",
      description: "Runtime environment (bun, node, workers, none)",
    },
    api: {
      type: "string",
      description: "API type",
    },
    webDeploy: {
      type: "string",
      description: "Web deployment target",
    },
    serverDeploy: {
      type: "string",
      description: "Server deployment target",
    },
    directoryConflict: {
      type: "string",
      description: "Directory conflict resolution strategy",
    },
    renderTitle: {
      type: "boolean",
      description: "Render Better-T-Stack title",
    },
    disableAnalytics: {
      type: "boolean",
      description: "Disable analytics",
    },
    manualDb: {
      type: "boolean",
      description:
        "Skip automatic/manual database setup prompt and use manual setup",
    },
    initMonorepo: {
      type: "boolean",
      description:
        "Initialize RSE monorepo structure (mutually exclusive with Better-T-Stack setup)",
    },
    bts: {
      type: "boolean",
      description: "Initialize Better-T-Stack project (default: false)",
    },
  }),
  run: async ({ args }) => {
    try {
      // Check if running in Bun
      if (typeof process.versions.bun === "undefined") {
        logger.error("❌ This command requires Bun runtime. Sorry.");
        process.exit(1);
      }

      // Handle RSE monorepo setup or Better-T-Stack setup (mutually exclusive)
      if (args.initMonorepo) {
        // RSE monorepo setup only
        const config = await promptMonorepoConfig();

        logger.info("");
        logger.info("🔨 Generating monorepo structure...");
        logger.info("");

        await generateRootPackageJson(config);
        await generateRootFiles(config);
        await generateAllPackages(config);

        logger.info("");
        logger.info("📦 Installing dependencies...");
        logger.info("");

        await $\`bun install\`.cwd(config.rootPath);

        logger.info("");
        logger.success("✅ Monorepo created successfully!");

        logger.info("");
        logger.success(\`📁 Location: \${config.rootPath}\`);
        logger.info("");
        logger.success("To get started:");
        logger.log(\`  cd \${config.rootPath}\`);
        logger.log("  bun --filter '*' dev");
        logger.info("");
      } else if (args.bts) {
        // Better-T-Stack setup only
        // Prepare Better-T-Stack options
        const btsOptions: Record<string, unknown> = {};

        if (args.verbose !== undefined) btsOptions.verbose = args.verbose;
        if (args.yes !== undefined) btsOptions.yes = args.yes;
        if (args.yolo !== undefined) btsOptions.yolo = args.yolo;
        if (args.database) btsOptions.database = args.database;
        if (args.orm) btsOptions.orm = args.orm;
        if (args.auth) btsOptions.auth = args.auth;
        if (args.payments) btsOptions.payments = args.payments;
        if (args.frontend) {
          btsOptions.frontend = args.frontend
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f);
        }
        if (args.addons) {
          btsOptions.addons = args.addons
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a);
        }
        if (args.examples) {
          btsOptions.examples = args.examples
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e);
        }
        if (args.git !== undefined) btsOptions.git = args.git;
        if (args.packageManager) btsOptions.packageManager = args.packageManager;
        if (args.install !== undefined) btsOptions.install = args.install;
        if (args.dbSetup) btsOptions.dbSetup = args.dbSetup;
        if (args.backend) btsOptions.backend = args.backend;
        if (args.runtime) btsOptions.runtime = args.runtime;
        if (args.api) btsOptions.api = args.api;
        if (args.webDeploy) btsOptions.webDeploy = args.webDeploy;
        if (args.serverDeploy) btsOptions.serverDeploy = args.serverDeploy;
        if (args.directoryConflict)
          btsOptions.directoryConflict = args.directoryConflict;
        if (args.renderTitle !== undefined)
          btsOptions.renderTitle = args.renderTitle;
        if (args.disableAnalytics !== undefined)
          btsOptions.disableAnalytics = args.disableAnalytics;
        if (args.manualDb !== undefined) btsOptions.manualDb = args.manualDb;

        logger.info("");
        logger.info("🚀 Initializing Better-T-Stack project...");
        logger.info("");
        const btsResult = await btsInit(args.name, btsOptions);

        if (!btsResult || !btsResult.success) {
          logger.error("❌ Failed to initialize Better-T-Stack project");
          process.exit(1);
        }

        logger.info("");
        logger.success("✅ Better-T-Stack project initialized successfully!");

        logger.info("");
        if (btsResult.projectDirectory) {
          logger.success(\`📁 Better-T-Stack project location: \${btsResult.projectDirectory}\`);
        }
        logger.info("");
      } else {
        logger.info("");
        logger.info("Please specify either --bts or --init-monorepo");
        logger.info("");
        logger.info("Examples:");
        logger.info("  rse init --bts");
        logger.info("  rse init --bts my-project --backend hono");
        logger.info("  rse init --init-monorepo");
        logger.info("");
      }
    } catch (error) {
      logger.info("");
      logger.error("❌ Error during initialization:");

      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }

      process.exit(1);
    }
  },
});
`;

  const cmdDir = dirname(initCmdPath);
  await mkdir(cmdDir, { recursive: true });
  await writeFile(initCmdPath, newContent, "utf-8");
  logger.success(`✅ Regenerated ${initCmdPath}`);
}

export default defineCommand({
  meta: {
    name: "bts",
    description:
      "Clone create-better-t-stack and move templates and src to packages/rebts/src",
    examples: [],
  },
  args: {},
  run: async () => {
    const tempDir = await createTempDirectory();
    const clonedRepoPath = join(tempDir, REPO_NAME);
    const cwd = process.cwd();
    const templatesSource = join(clonedRepoPath, "apps", "cli", "templates");
    const templatesDest = join(cwd, "packages", "rebts", "src", "templates");
    const srcSource = join(clonedRepoPath, "apps", "cli", "src");
    const srcDest = join(cwd, "packages", "rebts", "src", "impl");
    const rebtsSrcDir = join(cwd, "packages", "rebts", "src");

    try {
      // Clone or use cached repository
      await cloneOrUseCache(clonedRepoPath);

      // Check if templates directory exists in cloned repo
      const templatesExists = await exists(templatesSource);
      if (!templatesExists) {
        throw new Error(
          `Templates directory not found at ${templatesSource} in cloned repository`,
        );
      }

      // Check if src directory exists in cloned repo
      const srcExists = await exists(srcSource);
      if (!srcExists) {
        throw new Error(
          `Src directory not found at ${srcSource} in cloned repository`,
        );
      }

      // Ensure packages/rebts/src exists
      const rebtsSrcExists = await exists(rebtsSrcDir);
      if (!rebtsSrcExists) {
        logger.info(`📁 Creating directory: ${rebtsSrcDir}`);
        await mkdir(rebtsSrcDir, { recursive: true });
      }

      // Delete existing templates directory if it exists
      const destExists = await exists(templatesDest);
      if (destExists) {
        logger.info(`🗑️  Removing existing templates directory...`);
        rmSync(templatesDest, { recursive: true, force: true });
      }

      // Move templates directory
      logger.info(`📦 Moving templates to ${templatesDest}...`);
      await rename(templatesSource, templatesDest);
      logger.success("✅ Templates moved successfully");

      // Escape all template files (except .hbs files) with double extensions
      logger.info(`🔒 Escaping template files...`);
      const escapedFiles = await escapeTemplateFiles(
        templatesDest,
        templatesDest,
        [".hbs"],
      );
      logger.success(
        `✅ Escaped ${escapedFiles.length} template files with double extensions`,
      );

      // Delete existing impl directory if it exists
      const implDestExists = await exists(srcDest);
      if (implDestExists) {
        logger.info(`🗑️  Removing existing impl directory...`);
        rmSync(srcDest, { recursive: true, force: true });
      }

      // Move src directory to impl
      logger.info(`📦 Moving src to ${srcDest}...`);
      await rename(srcSource, srcDest);
      logger.success("✅ Src moved successfully");

      // Process index.ts file
      const indexPath = join(srcDest, "index.ts");
      const modPath = join(cwd, "packages", "rebts", "src", "mod.ts");
      const indexExists = await exists(indexPath);
      if (indexExists) {
        logger.info(`📝 Processing index.ts...`);
        await processIndexFile(indexPath, modPath);
        logger.success("✅ Processed index.ts and created mod.ts");

        // Regenerate init command
        const initCmdPath = join(cwd, "cli", "src", "cmds", "init", "cmd.ts");
        logger.info(`🔄 Regenerating init command...`);
        await regenerateInitCommand(initCmdPath);
        logger.success("✅ Init command regenerated");
      } else {
        logger.warn(
          `⚠️  index.ts not found at ${indexPath}, skipping processing`,
        );
      }
    } catch (error) {
      logger.error(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    } finally {
      // Always cleanup temp directory
      await cleanupTempDirectory(tempDir);
    }
  },
});
