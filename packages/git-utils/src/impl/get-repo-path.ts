import {
  BTS_CACHE_DIRECTORY,
  BTS_REPO_PATH,
  BTS_TIMESTAMP_PATH,
} from "./constants";

export function getBetterTStackCacheDirectory(): string {
  return BTS_CACHE_DIRECTORY;
}

export function getBetterTStackRepoPath(): string {
  return BTS_REPO_PATH;
}

export function getBetterTStackTimestampPath(): string {
  return BTS_TIMESTAMP_PATH;
}
