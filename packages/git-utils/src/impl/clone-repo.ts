import { rmSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { logger } from "@reliverse/dler-logger";
import { $ } from "bun";
import { BTS_REPO_URL } from "./constants";
import { pathExists } from "./fs-utils";
import {
  getBetterTStackCacheDirectory,
  getBetterTStackRepoPath,
} from "./get-repo-path";

export async function cloneBetterTStackRepo(): Promise<string> {
  const cacheDir = getBetterTStackCacheDirectory();
  const repoPath = getBetterTStackRepoPath();

  await mkdir(cacheDir, { recursive: true });

  if (await pathExists(repoPath)) {
    rmSync(repoPath, { recursive: true, force: true });
  }

  logger.info("📥 Cloning Better-T-Stack repository...");
  await $`git clone ${BTS_REPO_URL} ${repoPath}`.quiet();
  logger.success("✅ Better-T-Stack repository cloned successfully");

  return repoPath;
}
