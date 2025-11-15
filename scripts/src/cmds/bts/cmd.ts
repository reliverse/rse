import { existsSync, rmSync } from "node:fs";
import { exists, mkdir, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import { $ } from "bun";

const REPO_URL = "https://github.com/AmanVarshney01/create-better-t-stack";
const REPO_NAME = "create-better-t-stack";

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
      // Clone repository
      logger.info(`📥 Cloning ${REPO_URL}...`);
      await $`git clone ${REPO_URL} ${clonedRepoPath}`.quiet();
      logger.success("✅ Repository cloned successfully");

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
