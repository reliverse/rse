import { homedir } from "node:os";
import { join } from "node:path";

export const BTS_REPO_URL =
  "https://github.com/AmanVarshney01/create-better-t-stack";
export const BTS_REPO_NAME = "create-better-t-stack";
export const BTS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const BTS_CACHE_DIRECTORY = join(
  homedir(),
  ".reliverse",
  "dler",
  "cache",
  "bts",
);
export const BTS_TIMESTAMP_PATH = join(BTS_CACHE_DIRECTORY, ".timestamp");
export const BTS_REPO_PATH = join(BTS_CACHE_DIRECTORY, BTS_REPO_NAME);
