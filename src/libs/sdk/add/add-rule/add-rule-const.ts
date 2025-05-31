import path from "@reliverse/pathkit";

import { homeDir } from "~/libs/sdk/constants";

import type { RuleRepo } from "./add-rule-types";

// ----------------------
// Constants & Micro Helpers
// ----------------------

export const CACHE_ROOT_DIR = path.join(homeDir, ".rse", "rules");
export const DEFAULT_BRANCH = "main";
export const RULE_FILE_EXTENSION = ".mdc";

/**
 * Returns the cache directory for a given repository owner.
 * @param owner - The repository owner.
 * @returns The cache directory path.
 */
export function getRepoCacheDir(owner: string): string {
  return path.join(CACHE_ROOT_DIR, owner);
}

// ----------------------
// Repository Configurations
// ----------------------

export const RULES_REPOS: RuleRepo[] = [
  {
    id: "blefnk/awesome-cursor-rules",
    author: "blefnk",
    name: "rse Rules",
    description: "AI IDE rules (Cursor, Windsurf, Copilot)",
    branch: "main",
    tags: ["cursor", "windsurf", "copilot"],
    category: "ide",
    isOfficial: true,
  },
  {
    id: "pontusab/directories",
    author: "pontusab",
    name: "Community Rules",
    description: "Community-contributed AI IDE rules",
    branch: "main",
    tags: ["community", "cursor"],
    category: "ide",
    isOfficial: false,
    isCommunity: true,
    communityPath: "packages/data/src/rules",
  },
];
