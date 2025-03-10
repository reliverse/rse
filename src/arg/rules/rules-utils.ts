import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import { ofetch } from "ofetch";
import os from "os";
import path from "pathe";

// Type definition for UNGH API response
export type UnghRepoResponse = {
  repo?: {
    pushedAt: string;
  };
};

// Repository configuration
export const RULES_REPOS = [
  {
    id: "blefnk/rules",
    author: "blefnk",
    name: "rules",
    description: "AI IDE rules (Cursor, Windsurf, Copilot)",
  },
];

/**
 * Check if Cursor rules directory exists in the current working directory
 * @param cwd Current working directory
 * @returns Boolean indicating if the directory exists
 */
export async function hasCursorRulesDir(cwd: string): Promise<boolean> {
  const rulesDir = path.join(cwd, ".cursor", "rules");
  return fs.pathExists(rulesDir);
}

/**
 * Check if updates are available for rule repositories
 * @param repoId Repository ID in format "owner/repo"
 * @returns Boolean indicating if updates are available
 */
export async function checkRulesRepoUpdate(repoId: string): Promise<boolean> {
  const [owner, repoName] = repoId.split("/");
  if (!owner || !repoName) return false;

  const homeDir = os.homedir();
  const repoCacheDir = path.join(homeDir, ".reliverse", "rules", owner);
  const versionFilePath = path.join(repoCacheDir, ".last_updated");

  // If cache doesn't exist, updates are considered available
  if (!(await fs.pathExists(repoCacheDir))) {
    return true;
  }

  let currentDate: string | null = null;

  // Read the current version date if it exists
  if (await fs.pathExists(versionFilePath)) {
    currentDate = await fs.readFile(versionFilePath, "utf-8");
  } else {
    // No version file means updates are available
    return true;
  }

  // Check for updates using UNGH
  try {
    const url = `https://ungh.cc/repos/${owner}/${repoName}`;
    const data = await ofetch<UnghRepoResponse>(url);
    const latestDate = data.repo?.pushedAt ?? null;

    if (!latestDate) return false;

    // If the stored date is older, an update is available
    if (new Date(currentDate) < new Date(latestDate)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return false;
  }
}

// Check for updates to rule files
export async function checkForRuleUpdates(isDev: boolean): Promise<boolean> {
  let hasUpdates = false;

  for (const repo of RULES_REPOS) {
    const repoId = repo.id;
    const hasRepoUpdate = await checkRulesRepoUpdate(repoId);

    if (hasRepoUpdate) {
      hasUpdates = true;
      if (isDev) {
        relinka("info", `Updates available for ${repoId}`);
      }
    }
  }

  return hasUpdates;
}
