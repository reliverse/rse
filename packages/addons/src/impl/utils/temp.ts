// apps/rse/src/cmds/init/utils/temp.ts

import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { logger } from "@reliverse/dler-logger";
import type { TempDirectory } from "../types";
import { ensureDir } from "../utils";

export const createTempDirectory = async (): Promise<TempDirectory> => {
  const timestamp = Date.now();
  const tempPath = join(
    homedir(),
    ".reliverse",
    "dler",
    "temp",
    "integrate",
    timestamp.toString(),
  );

  await ensureDir(tempPath);

  logger.debug(`📁 Created temp directory: ${tempPath}`);

  return {
    path: tempPath,
    cleanup: async () => {
      try {
        if (existsSync(tempPath)) {
          rmSync(tempPath, { recursive: true, force: true });
          logger.debug(`🧹 Cleaned up temp directory: ${tempPath}`);
        }
      } catch (error) {
        logger.warn(`⚠️ Failed to clean up temp directory: ${error}`);
      }
    },
  };
};

export const createIntegrationTempDir = async (
  tempDir: TempDirectory,
  integrationName: string,
): Promise<string> => {
  const integrationPath = join(tempDir.path, `${integrationName}-temp`);
  await ensureDir(integrationPath);
  return integrationPath;
};
