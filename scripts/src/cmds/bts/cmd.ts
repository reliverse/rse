import { rmSync } from "node:fs";
import { exists, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
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

function transformFileContent(content: string, fileName: string): string {
  let transformed = content;

  // Replace @clack/prompts imports - replace with logger
  transformed = transformed.replace(
    /import\s+\{[^}]*\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    'import { logger } from "@reliverse/dler-logger";\n',
  );
  transformed = transformed.replace(
    /import\s+.*\s+from\s+["']@clack\/prompts["'];?\n?/g,
    'import { logger } from "@reliverse/dler-logger";\n',
  );

  // Replace picocolors imports
  transformed = transformed.replace(
    /import\s+pc\s+from\s+["']picocolors["'];?\n?/g,
    'import colors from "@reliverse/dler-colors";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*\}\s+from\s+["']picocolors["'];?\n?/g,
    'import colors from "@reliverse/dler-colors";\n',
  );

  // Remove @orpc/server imports
  transformed = transformed.replace(
    /import\s+.*from\s+["']@orpc\/server["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*createRouterClient[^}]*\}\s*from\s+["']@orpc\/server["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*os[^}]*\}\s*from\s+["']@orpc\/server["'];?\n?/g,
    "",
  );

  // Remove trpc-cli imports
  transformed = transformed.replace(
    /import\s+.*from\s+["']trpc-cli["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*createCli[^}]*\}\s*from\s+["']trpc-cli["'];?\n?/g,
    "",
  );

  // Replace clack/prompts usage with logger
  transformed = transformed.replace(/\bintro\(/g, "logger.info(");
  transformed = transformed.replace(
    /\blog\.(success|info|warn|error)\(/g,
    "logger.$1(",
  );
  transformed = transformed.replace(/\blog\.message\(/g, "logger.log(");
  transformed = transformed.replace(/\boutro\(/g, "logger.info(");

  // Replace picocolors usage
  transformed = transformed.replace(/\bpc\./g, "colors.");
  transformed = transformed.replace(/\bpc\b/g, "colors");

  // Special handling for index.ts -> init.ts transformation
  if (fileName === "index.ts") {
    // Remove router definition
    transformed = transformed.replace(
      /export\s+const\s+router\s*=\s*os\.router\(\{[\s\S]*?\}\);?\n?/g,
      "",
    );

    // Remove createBtsCli function
    transformed = transformed.replace(
      /export\s+function\s+createBtsCli\(\)\s*\{[\s\S]*?\}\n?/g,
      "",
    );

    // Remove caller definition
    transformed = transformed.replace(
      /const\s+caller\s*=\s*createRouterClient\([^)]+\);?\n?/g,
      "",
    );

    // Transform init function to call handler directly
    transformed = transformed.replace(
      /export\s+async\s+function\s+init\([^)]*\)\s*\{[\s\S]*?const\s+result\s*=\s*await\s+caller\.init\([^)]+\);[\s\S]*?return\s+result\s+as\s+InitResult;[\s\S]*?\}/,
      `export async function init(projectName?: string, options?: CreateInput) {
	const opts = (options ?? {}) as CreateInput;
	const combinedInput = {
		projectName,
		...opts,
	};
	const result = await createProjectHandler(combinedInput);
	return result as InitResult;
}`,
    );

    // Add add function (it doesn't exist as exported function, only as router route)
    // Insert after init function
    transformed = transformed.replace(
      /(export async function init\([^)]*\)\s*\{[\s\S]*?\n\})/,
      `$1\n\nexport async function add(options?: AddInput) {
	await addAddonsHandler(options ?? {});
}`,
    );

    // Transform other functions to call handlers directly
    transformed = transformed.replace(
      /export\s+async\s+function\s+sponsors\(\)\s*\{[\s\S]*?return\s+caller\.sponsors\(\);[\s\S]*?\}/,
      `export async function sponsors() {
	try {
		renderTitle();
		logger.info(colors.magenta("Better-T-Stack Sponsors"));
		const sponsors = await fetchSponsors();
		displaySponsors(sponsors);
	} catch (error) {
		handleError(error, "Failed to display sponsors");
	}
}`,
    );

    transformed = transformed.replace(
      /export\s+async\s+function\s+docs\(\)\s*\{[\s\S]*?return\s+caller\.docs\(\);[\s\S]*?\}/,
      `export async function docs() {
	const DOCS_URL = "https://better-t-stack.dev/docs";
	try {
		await openUrl(DOCS_URL);
		logger.success(colors.blue("Opened docs in your default browser."));
	} catch {
		logger.log(\`Please visit \${DOCS_URL}\`);
	}
}`,
    );

    transformed = transformed.replace(
      /export\s+async\s+function\s+builder\(\)\s*\{[\s\S]*?return\s+caller\.builder\(\);[\s\S]*?\}/,
      `export async function builder() {
	const BUILDER_URL = "https://better-t-stack.dev/new";
	try {
		await openUrl(BUILDER_URL);
		logger.success(colors.blue("Opened builder in your default browser."));
	} catch {
		logger.log(\`Please visit \${BUILDER_URL}\`);
	}
}`,
    );
  }

  return transformed;
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
      // Read as text for TypeScript files to apply transformations
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = await Bun.file(srcPath).text();
        const transformed = transformFileContent(content, entry.name);
        await Bun.write(destPath, transformed);
      } else {
        // Copy binary files as-is
        const content = await Bun.file(srcPath).arrayBuffer();
        await Bun.write(destPath, content);
      }
    }
  }
}

async function ensureCacheIsValid(): Promise<void> {
  const cacheDir = getCacheDirectory();
  const cachedRepo = getCachedRepoPath();
  const isValid = await isCacheValid();

  if (!isValid) {
    if (await exists(cachedRepo)) {
      logger.info("🔄 Cache expired, re-downloading repository...");
      rmSync(cachedRepo, { recursive: true, force: true });
    } else {
      logger.info(`📥 Cloning ${REPO_URL}...`);
    }

    // Clone to cache
    await mkdir(cacheDir, { recursive: true });
    await $`git clone ${REPO_URL} ${cachedRepo}`.quiet();
    await updateCacheTimestamp();
    logger.success("✅ Repository cloned successfully");
  } else {
    logger.info("📦 Using cached repository...");
  }
}

export default defineCommand({
  meta: {
    name: "bts",
    description:
      "Clone create-better-t-stack and move src to packages/rebts/src/impl",
    examples: [],
  },
  args: {},
  run: async () => {
    const cwd = process.cwd();
    const cachedRepo = getCachedRepoPath();
    const srcSource = join(cachedRepo, "apps", "cli", "src");
    const srcDest = join(cwd, "packages", "rebts", "src", "impl");
    const rebtsSrcDir = join(cwd, "packages", "rebts", "src");

    try {
      // Ensure cache is valid (clone if needed)
      await ensureCacheIsValid();

      // Check if src directory exists in cached repo
      const srcExists = await exists(srcSource);
      if (!srcExists) {
        throw new Error(
          `Src directory not found at ${srcSource} in cached repository`,
        );
      }

      // Ensure packages/rebts/src exists
      const rebtsSrcExists = await exists(rebtsSrcDir);
      if (!rebtsSrcExists) {
        logger.info(`📁 Creating directory: ${rebtsSrcDir}`);
        await mkdir(rebtsSrcDir, { recursive: true });
      }

      // Delete existing impl directory if it exists
      const implDestExists = await exists(srcDest);
      if (implDestExists) {
        logger.info(`🗑️  Removing existing impl directory...`);
        rmSync(srcDest, { recursive: true, force: true });
      }

      // Copy and transform src directory from cache to impl
      logger.info(
        `📦 Copying and transforming src from cache to ${srcDest}...`,
      );
      await copyDirectoryRecursive(srcSource, srcDest);
      logger.success("✅ Src copied and transformed successfully");
    } catch (error) {
      logger.error(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  },
});
