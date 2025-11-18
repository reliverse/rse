import { mkdir, readFile, writeFile } from "node:fs/promises";
import { logger } from "@reliverse/dler-logger";
import { cloneBetterTStackRepo } from "./clone-repo";
import { BTS_CACHE_TTL_MS } from "./constants";
import { pathExists } from "./fs-utils";
import {
  getBetterTStackCacheDirectory,
  getBetterTStackRepoPath,
  getBetterTStackTimestampPath,
} from "./get-repo-path";

type EnsureOptions = {
  forceRefresh?: boolean;
};

async function updateCacheTimestamp(): Promise<void> {
  const cacheDir = getBetterTStackCacheDirectory();
  const timestampPath = getBetterTStackTimestampPath();
  await mkdir(cacheDir, { recursive: true });
  await writeFile(timestampPath, Date.now().toString(), { encoding: "utf-8" });
}

async function isCacheValid(): Promise<boolean> {
  const repoPath = getBetterTStackRepoPath();
  const timestampPath = getBetterTStackTimestampPath();

  const repoExists = await pathExists(repoPath);
  const timestampExists = await pathExists(timestampPath);

  if (!repoExists || !timestampExists) {
    return false;
  }

  try {
    const timestampContent = await readFile(timestampPath, {
      encoding: "utf-8",
    });
    const lastDownloadTime = Number.parseInt(timestampContent.trim(), 10);

    if (Number.isNaN(lastDownloadTime)) {
      return false;
    }

    const age = Date.now() - lastDownloadTime;
    return age < BTS_CACHE_TTL_MS;
  } catch {
    return false;
  }
}

export async function ensureBetterTStackRepo(
  options: EnsureOptions = {},
): Promise<string> {
  const repoPath = getBetterTStackRepoPath();
  const shouldRefresh =
    options.forceRefresh === true || !(await isCacheValid());

  if (shouldRefresh) {
    logger.info("🔄 Refreshing Better-T-Stack cache...");
    const clonedPath = await cloneBetterTStackRepo();
    await updateCacheTimestamp();
    return clonedPath;
  }

  logger.info("📦 Using cached Better-T-Stack repository...");
  return repoPath;
}
