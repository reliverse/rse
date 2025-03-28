import { ensuredir } from "@reliverse/fs";
import { multiselectPrompt, confirmPrompt } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import { ofetch } from "ofetch";
import pMap from "p-map";
import path from "pathe";

import { getMaxHeightSize } from "~/libs/sdk/utils/microHelpers.js";

import type { UnghRepoResponse } from "./add-rule-types.js";

import {
  DEFAULT_BRANCH,
  getRepoCacheDir,
  RULE_FILE_EXTENSION,
  RULES_REPOS,
} from "./add-rule-const.js";

// ----------------------
// Utility Functions
// ----------------------

/**
 * Remove unwanted header and footer lines from a TypeScript rule file.
 * It removes a leading block (up to and including "content:")
 * and a trailing block starting with ", author:".
 *
 * @param content - The raw file content.
 * @returns The cleaned content.
 */
function cleanTsContent(content: string): string {
  content = content.replace(/^.*?content:\s*/s, "");
  content = content.replace(/,\s*author:\s*\{[\s\S]*$/s, "");
  return content.trim();
}

/**
 * Converts a TypeScript rule file to markdown content (.mdc).
 * It removes redundant declarations, import statements, and unwanted blocks.
 *
 * @param content - The raw TypeScript file content.
 * @param filePath - The source file path.
 * @returns The converted markdown content.
 */
export function convertTsToMdc(content: string, filePath: string): string {
  let cleaned = content.replace(/export\s+const\s+\w+\s*=\s*/, "");
  cleaned = cleaned.replace(/;\s*$/, "");
  cleaned = cleaned.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");
  cleaned = cleaned.replace(/export\s+default\s+/, "");
  cleaned = cleaned.replace(/`/g, "");
  cleaned = cleaned.trim();

  cleaned = cleanTsContent(cleaned);

  const frontmatter = [
    "---",
    `description: ${path.basename(filePath, ".ts")}`,
    "glob: []",
    "alwaysApply: false",
    "---",
    "",
  ].join("\n");

  return frontmatter + cleaned;
}

/**
 * Checks if the Cursor rules directory exists in the given working directory.
 * @param cwd - Current working directory.
 * @returns Boolean indicating if the directory exists.
 */
export async function hasCursorRulesDir(cwd: string): Promise<boolean> {
  const rulesDir = path.join(cwd, ".cursor", "rules");
  return fs.pathExists(rulesDir);
}

/**
 * Checks if at least one installed .mdc rule file exists in the .cursor/rules folder.
 * @param cwd - Current working directory.
 * @returns Boolean indicating if at least one .mdc file exists.
 */
export async function hasInstalledRules(cwd: string): Promise<boolean> {
  const rulesDir = path.join(cwd, ".cursor", "rules");
  if (!(await fs.pathExists(rulesDir))) return false;
  const files = await fs.readdir(rulesDir);
  return files.some((file) => file.endsWith(RULE_FILE_EXTENSION));
}

/**
 * Checks if updates are available for a given rule repository.
 * @param repoId - Repository ID in format "owner/repo".
 * @returns Boolean indicating if an update is available.
 */
export async function checkRulesRepoUpdate(repoId: string): Promise<boolean> {
  const [owner, repoName] = repoId.split("/");
  if (!owner || !repoName) return false;

  const repoCacheDir = getRepoCacheDir(owner);
  const versionFilePath = path.join(repoCacheDir, ".last_updated");

  if (!(await fs.pathExists(repoCacheDir))) {
    return true;
  }

  let currentDate: string | null = null;
  if (await fs.pathExists(versionFilePath)) {
    currentDate = await fs.readFile(versionFilePath, "utf-8");
  } else {
    return true;
  }

  try {
    const url = `https://ungh.cc/repos/${owner}/${repoName}`;
    const data = await ofetch<UnghRepoResponse>(url);
    const latestDate = data.repo?.pushedAt ?? null;
    if (!latestDate) return false;
    return new Date(currentDate) < new Date(latestDate);
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return false;
  }
}

/**
 * Checks for updates only for rule repositories that are installed (i.e. their cache exists).
 * @param isDev - Flag indicating development mode.
 * @returns Boolean indicating if any updates are available.
 */
export async function checkForRuleUpdates(isDev: boolean): Promise<boolean> {
  let hasUpdates = false;
  for (const repo of RULES_REPOS) {
    const [owner] = repo.id.split("/");
    if (!owner) continue;
    if (!(await fs.pathExists(getRepoCacheDir(owner)))) continue;

    const hasRepoUpdate = await checkRulesRepoUpdate(repo.id);
    if (hasRepoUpdate) {
      hasUpdates = true;
      if (isDev) {
        relinka("info", `Updates available for ${repo.id}`);
      }
    }
  }
  return hasUpdates;
}

/**
 * Retrieves cached rule files for a given repository owner.
 * @param owner - The repository owner.
 * @returns Array of cached rule file names.
 */
async function getCachedRuleFiles(owner: string): Promise<string[]> {
  relinka("info-verbose", `Getting cached rule files for owner: ${owner}`);
  const repoCacheDir = getRepoCacheDir(owner);
  if (!(await fs.pathExists(repoCacheDir))) {
    relinka("info-verbose", `Cache directory does not exist: ${repoCacheDir}`);
    return [];
  }

  try {
    const files = await fs.readdir(repoCacheDir, { recursive: true });
    const filteredFiles = (files as string[]).filter(
      (file) =>
        typeof file === "string" &&
        file.endsWith(RULE_FILE_EXTENSION) &&
        !file.startsWith("."),
    );
    relinka(
      "success",
      `Found ${filteredFiles.length} rule files (${RULE_FILE_EXTENSION}) in cache`,
    );
    return filteredFiles;
  } catch (error) {
    relinka("error", `Failed to read cached rules: ${error}`);
    return [];
  }
}

/**
 * Downloads rules from a repository.
 * Presents a multiselect prompt with all available rule files. Files that already exist
 * in the cache will be labeled with a "(cached)" hint and will simply be reused.
 * Files not cached will be downloaded (and converted if needed) and then saved.
 *
 * @param repoId - Repository identifier ("owner/repoName").
 * @param isDev - Flag indicating development mode.
 * @returns Array of file names (cached filenames) that will be installed.
 */
export async function downloadRules(
  repoId: string,
  isDev: boolean,
): Promise<string[]> {
  relinka("info-verbose", `Development mode: ${isDev}`);
  relinka(
    "info-verbose",
    `Starting download process for repository: ${repoId}`,
  );
  const [owner, repoName] = repoId.split("/");
  if (!owner || !repoName) {
    relinka("error", "Invalid repository ID format");
    return [];
  }
  const repo = RULES_REPOS.find((r) => r.id === repoId);
  if (!repo) {
    relinka("error", "Repository not found in configuration");
    return [];
  }

  const branch = repo.branch || DEFAULT_BRANCH;
  const repoCacheDir = getRepoCacheDir(owner);
  // Ensure the cache directory exists.
  await ensuredir(repoCacheDir);
  relinka("info-verbose", `Cache directory: ${repoCacheDir}`);

  const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`;
  let availableFiles: { path: string; type: string }[] = [];

  try {
    const repoData = await ofetch<{
      tree: { path: string; type: string; url: string }[];
    }>(apiUrl, {
      retry: 3,
      retryDelay: 1000,
      onResponseError: (error) => {
        if (error.response?.status === 404) {
          throw new Error(
            `Repository or branch not found: ${repoId}#${branch}`,
          );
        }
        if (error.response?.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later.",
          );
        }
        throw new Error(
          `Failed to fetch repository: ${
            error.response?.statusText || "Unknown error"
          }`,
        );
      },
    });

    if (repo.isCommunity) {
      const communityPath = repo.communityPath;
      if (!communityPath) {
        relinka("error", "Community path not defined for repository");
        return [];
      }
      availableFiles = repoData.tree.filter(
        (item) =>
          item.type === "blob" &&
          item.path.endsWith(".ts") &&
          item.path.startsWith(communityPath) &&
          !item.path.split("/").some((part) => part.startsWith(".")),
      );
    } else {
      availableFiles = repoData.tree.filter(
        (item) =>
          item.type === "blob" &&
          item.path.endsWith(".md") &&
          item.path.toLowerCase() !== "readme.md" &&
          !item.path.split("/").some((part) => part.startsWith(".")),
      );
    }

    if (availableFiles.length === 0) {
      relinka("error", "No rule files found in repository");
      return [];
    }

    const maxItems = getMaxHeightSize();
    const totalFiles = availableFiles.length;
    availableFiles = availableFiles.slice(0, maxItems);

    // Get currently cached files.
    const cachedFiles = await getCachedRuleFiles(owner);

    // Build multiselect options.
    const options = availableFiles.map((file, index) => {
      const baseName = path.basename(file.path);
      let expectedCacheFile: string;
      if (repo.isCommunity) {
        expectedCacheFile = `${path.basename(file.path, ".ts")}${RULE_FILE_EXTENSION}`;
      } else {
        expectedCacheFile = `${path.basename(file.path, ".md")}${RULE_FILE_EXTENSION}`;
      }
      const isCached = cachedFiles.includes(expectedCacheFile);
      return {
        value: file.path,
        label: `${index + 1}. ${baseName}`,
        hint: isCached ? "cached" : undefined,
      };
    });

    // Always display the multiselect prompt.
    const selectedFiles = await multiselectPrompt<string>({
      title: `Select rules to download from ${repoId} (${Math.min(
        totalFiles,
        maxItems,
      )} of ${totalFiles} available)`,
      content: `If you don't see all rules, try increasing your terminal height (current: ${maxItems})`,
      options,
    });

    if (selectedFiles.length === 0) {
      relinka("error", "No rules selected for download");
      return [];
    }

    const downloadedFiles: string[] = [];
    const total = selectedFiles.length;

    await pMap(
      selectedFiles,
      async (filePath: string) => {
        let expectedCacheFile: string;
        if (repo.isCommunity) {
          expectedCacheFile = `${path.basename(filePath, ".ts")}${RULE_FILE_EXTENSION}`;
        } else {
          expectedCacheFile = `${path.basename(filePath, ".md")}${RULE_FILE_EXTENSION}`;
        }
        const cacheFilePath = path.join(repoCacheDir, expectedCacheFile);

        // If file is already cached, log and reuse it.
        if (await fs.pathExists(cacheFilePath)) {
          relinka("info-verbose", `[Cached] ${filePath} is already in cache.`);
          downloadedFiles.push(expectedCacheFile);
          return;
        }

        try {
          const contentUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${filePath}`;
          const content = await ofetch<string>(contentUrl, {
            responseType: "text" as any,
            retry: 2,
            retryDelay: 500,
          });

          if (repo.isCommunity) {
            const mdContent = convertTsToMdc(content, filePath);
            await fs.writeFile(cacheFilePath, mdContent);
          } else {
            await fs.writeFile(cacheFilePath, content);
          }
          downloadedFiles.push(expectedCacheFile);
          relinka(
            "info-verbose",
            `[${downloadedFiles.length}/${total}] Processed ${filePath}`,
          );
        } catch (error) {
          relinka("error", `Failed to process ${filePath}: ${error}`);
        }
      },
      { concurrency: 5 },
    );

    if (downloadedFiles.length === 0) {
      relinka("error", "Failed to download any rule files");
      return [];
    }

    const metadata = {
      repoId,
      branch,
      downloadedAt: new Date().toISOString(),
      totalFiles: downloadedFiles.length,
      tags: repo.tags || [],
      isOfficial: repo.isOfficial || false,
      isCommunity: repo.isCommunity || false,
    };

    await fs.writeFile(
      path.join(repoCacheDir, ".metadata.json"),
      JSON.stringify(metadata, null, 2),
    );
    await fs.writeFile(
      path.join(repoCacheDir, ".last_updated"),
      new Date().toISOString(),
    );

    relinka(
      "success-verbose",
      `Processed ${downloadedFiles.length}/${total} rule file(s) successfully`,
    );
    return downloadedFiles;
  } catch (error) {
    relinka("error", `Failed to download rules: ${error}`);
    return [];
  }
}

/**
 * Installs selected rules into the Cursor rules directory.
 * Copies the cached files (with .mdc extension) into .cursor/rules,
 * automatically overwriting any existing file.
 *
 * @param files - Array of cached file names to install.
 * @param owner - Repository owner.
 * @param cwd - Current working directory.
 */
export async function installRules(
  files: string[],
  owner: string,
  cwd: string,
): Promise<void> {
  relinka(
    "info-verbose",
    `Installing ${files.length} rule(s) from owner: ${owner}`,
  );
  const repoCacheDir = getRepoCacheDir(owner);
  const cursorRulesDir = path.join(cwd, ".cursor", "rules");

  await ensuredir(cursorRulesDir);
  relinka("info-verbose", `Source directory: ${repoCacheDir}`);
  relinka("info-verbose", `Target directory: ${cursorRulesDir}`);

  let installedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const sourceFile = path.join(repoCacheDir, file);
    const baseFileName = path.basename(file, path.extname(file));
    const targetFileName = `${baseFileName}${RULE_FILE_EXTENSION}`;
    const targetFile = path.join(cursorRulesDir, targetFileName);

    relinka("info-verbose", `Copying file: ${file} -> ${targetFile}`);
    try {
      // Overwrite any existing file without prompting.
      await fs.copy(sourceFile, targetFile, { overwrite: true });
      installedCount++;
      relinka("success", `Installed ${targetFileName}`);
    } catch (error) {
      relinka("error", `Failed to install ${file}: ${error}`);
      skippedCount++;
    }
  }

  if (files.length > 5) {
    relinka("success", `Installed ${installedCount} rule file(s)`);
  }
  if (skippedCount > 0) {
    relinka("info-verbose", `Skipped ${skippedCount} rule file(s)`);
  }
  relinka(
    "info-verbose",
    `Total installed: ${installedCount}, skipped: ${skippedCount}`,
  );
}

/**
 * Handles rule updates by checking, downloading, and installing updates.
 * Only processes repositories that are installed (where the cache directory exists).
 * @param cwd - Current working directory.
 * @param isDev - Flag indicating development mode.
 */
export async function handleRuleUpdates(
  cwd: string,
  isDev: boolean,
): Promise<void> {
  relinka("info-verbose", `Checking for rule updates in workspace: ${cwd}`);
  const hasUpdates = await checkForRuleUpdates(isDev);
  if (!hasUpdates) {
    relinka("success", "No updates available for installed rules");
    return;
  }

  relinka("info-verbose", "Updates available for installed rules");
  const shouldUpdate = await confirmPrompt({
    title: "Updates available for installed rules. Download now?",
  });
  if (!shouldUpdate) {
    relinka("info-verbose", "User chose not to update rules");
    return;
  }

  relinka("info-verbose", "Starting rule update process");
  for (const repo of RULES_REPOS) {
    const [owner] = repo.id.split("/");
    if (!owner) continue;
    if (!(await fs.pathExists(getRepoCacheDir(owner)))) continue;

    relinka("info", `Updating rules for repository: ${repo.id}`);
    const repoId = repo.id;
    const hasRepoUpdate = await checkRulesRepoUpdate(repoId);
    if (hasRepoUpdate) {
      relinka("info", `Updates available for ${repoId}, downloading...`);
      const files = await downloadRules(repoId, isDev);
      if (files.length > 0 && (await hasCursorRulesDir(cwd))) {
        relinka(
          "info",
          `Installing downloaded rules into ${cwd}/.cursor/rules`,
        );
        await installRules(files, owner, cwd);
      }
    } else {
      relinka("info", `No updates available for ${repo.id}`);
    }
  }
  relinka("success", "Rule updates completed");
}
