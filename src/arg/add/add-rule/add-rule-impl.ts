import { ensuredir } from "@reliverse/fs";
import {
  selectPrompt,
  multiselectPrompt,
  confirmPrompt,
} from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import { ofetch } from "ofetch";
import path from "pathe";

import {
  DEFAULT_BRANCH,
  getRepoCacheDir,
  RULE_FILE_EXTENSION,
  RULES_REPOS,
} from "./add-rule-const.js";
import {
  convertTsToMdc,
  downloadRules,
  handleRuleUpdates,
  hasInstalledRules,
  installRules,
} from "./add-rule-utils.js";

/**
 * Called when the user passes `--get <names>` or `--get all`.
 * Skips the interactive selection.
 */
export async function handleDirectRules(opts: {
  cwd: string;
  isDev: boolean;
  source: "official" | "community" | "prompt";
  ruleNames: string[]; // e.g. ["all"] or ["001-general-rules", "1000-typescript.mdc", ...]
}): Promise<void> {
  const { cwd, source, ruleNames } = opts;

  // 1) Determine which repository to use based on `source`
  let repoId = "";
  if (source === "official") {
    repoId = "blefnk/awesome-cursor-rules";
  } else if (source === "community") {
    repoId = "pontusab/directories";
  } else {
    // If source=prompt but user passed `--get`, that is contradictory,
    // but let's handle it gracefully or throw an error:
    throw new Error(
      "Cannot use source='prompt' together with --get. Please specify `--source official` or `--source community`.",
    );
  }

  // 2) We fetch all available files from the repo
  const allAvailable = await fetchRepoFiles(repoId);
  if (allAvailable.length === 0) {
    relinka("error", "No rule files found in repository");
    return;
  }

  // 3) If user says `--get all`, we just take them all
  const userWantsAll = ruleNames.length === 1 && ruleNames[0] === "all";
  let targetNames: string[] = [];

  if (userWantsAll) {
    targetNames = allAvailable.map((f) => f.baseNameNoExt);
  } else {
    // Convert each name by removing potential extensions like .mdc, .ts, .md
    targetNames = ruleNames.map((name) => removeExtension(name));
  }

  // Filter the full list to only those that match user-specified names
  const selected = allAvailable.filter((item) =>
    targetNames.includes(item.baseNameNoExt),
  );

  if (selected.length === 0) {
    relinka("error", "No matching rule files found for your --get arguments");
    return;
  }

  // 4) We skip the interactive multi-select & pass these directly
  // to the "downloadAndInstall" logic
  const downloadedFiles = await downloadSpecificFiles(repoId, selected);
  if (downloadedFiles.length === 0) {
    relinka("error", "No rule files downloaded");
    return;
  }

  // 5) Finally install them into .cursor/rules
  const [owner] = repoId.split("/");
  if (!owner) {
    relinka("error", `Invalid repository: ${repoId}`);
    return;
  }

  await installRules(downloadedFiles, owner, cwd);
  relinka("success-verbose", "Rules installation completed (no prompt).");
}

/**
 * fetchRepoFiles: returns an array of objects describing all valid rule files in the repo
 * (both community .ts rules and official .md rules).
 */
async function fetchRepoFiles(repoId: string): Promise<
  {
    path: string;
    baseName: string;
    baseNameNoExt: string;
    isCommunity: boolean;
  }[]
> {
  const repo = RULES_REPOS.find((r) => r.id === repoId);
  if (!repo) {
    relinka("error", `Repository not found in config: ${repoId}`);
    return [];
  }

  const [owner, repoName] = repoId.split("/");
  const branch = repo.branch || DEFAULT_BRANCH;
  const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`;

  try {
    const repoData = await ofetch<{
      tree: { path: string; type: string; url: string }[];
    }>(apiUrl, { retry: 3, retryDelay: 1000 });

    let matches: { path: string; type: string }[] = [];
    if (repo.isCommunity) {
      const comPath = repo.communityPath || "";
      matches = repoData.tree.filter(
        (item) =>
          item.type === "blob" &&
          item.path.endsWith(".ts") &&
          item.path.startsWith(comPath) &&
          !item.path.split("/").some((part) => part.startsWith(".")),
      );
    } else {
      // official
      matches = repoData.tree.filter(
        (item) =>
          item.type === "blob" &&
          item.path.endsWith(".md") &&
          item.path.toLowerCase() !== "readme.md" &&
          !item.path.split("/").some((part) => part.startsWith(".")),
      );
    }

    return matches.map((file) => {
      const bn = path.basename(file.path);
      let baseNoExt = "";
      if (repo.isCommunity) {
        // remove ".ts" from the end
        baseNoExt = path.basename(bn, ".ts");
      } else {
        baseNoExt = path.basename(bn, ".md");
      }
      return {
        path: file.path,
        baseName: bn,
        baseNameNoExt: baseNoExt,
        isCommunity: !!repo.isCommunity,
      };
    });
  } catch (error) {
    relinka("error", `Failed to fetch repo files from ${repoId}: ${error}`);
    return [];
  }
}

/**
 * Removes possible .ts / .md / .mdc extension from a user-provided rule name.
 */
function removeExtension(name: string): string {
  // E.g. user typed "001-general-rules.ts" => "001-general-rules"
  // or "1000-typescript.mdc" => "1000-typescript"
  // or "myRule.md" => "myRule"
  const exts = [".ts", ".md", ".mdc"];
  let result = name;
  for (const ext of exts) {
    if (result.toLowerCase().endsWith(ext)) {
      result = result.slice(0, -ext.length);
      break;
    }
  }
  return result;
}

/**
 * Downloads a known subset of files (already determined) from the repo
 * (skipping interactive multiselect).
 */
async function downloadSpecificFiles(
  repoId: string,
  files: {
    path: string;
    baseName: string;
    baseNameNoExt: string;
    isCommunity: boolean;
  }[],
): Promise<string[]> {
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
  await ensuredir(repoCacheDir);

  const results: string[] = [];
  for (const fileInfo of files) {
    // figure out the final .mdc name in cache
    let expectedCacheFile = "";
    if (fileInfo.isCommunity) {
      expectedCacheFile = `${fileInfo.baseNameNoExt}${RULE_FILE_EXTENSION}`;
    } else {
      expectedCacheFile = `${fileInfo.baseNameNoExt}${RULE_FILE_EXTENSION}`;
    }

    const cacheFilePath = path.join(repoCacheDir, expectedCacheFile);
    if (await fs.pathExists(cacheFilePath)) {
      relinka("info-verbose", `[Cached] ${fileInfo.path} is already in cache.`);
      results.push(expectedCacheFile);
      continue;
    }

    // Download
    try {
      const contentUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${fileInfo.path}`;
      const content = await ofetch<string>(contentUrl, {
        responseType: "json",
        retry: 2,
        retryDelay: 500,
      });

      if (fileInfo.isCommunity) {
        // convert ts => .mdc
        const mdContent = convertTsToMdc(content, fileInfo.path);
        await fs.writeFile(cacheFilePath, mdContent);
      } else {
        // official => .md => .mdc
        await fs.writeFile(cacheFilePath, content);
      }
      results.push(expectedCacheFile);
      relinka("info-verbose", `Downloaded & processed ${fileInfo.path}`);
    } catch (error) {
      relinka("error", `Failed to download ${fileInfo.path}: ${error}`);
    }
  }

  // Update metadata & last_updated
  if (results.length > 0) {
    const metadata = {
      repoId,
      branch,
      downloadedAt: new Date().toISOString(),
      totalFiles: results.length,
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
  }

  return results;
}

type AddRuleMenuChoice =
  | "download-official"
  | "download-community"
  | "update"
  | "manage"
  | "exit";

/**
 * Main menu handler for the rules command.
 * If `source` is "prompt", we display the interactive menu.
 * If `source` is "official" or "community", we skip the menu
 * and download from that source directly.
 */
export async function showRulesMenu({
  cwd,
  isDev,
  source,
}: {
  cwd: string;
  isDev: boolean;
  source: "official" | "community" | "prompt";
}): Promise<void> {
  // 1. If the user specified an explicit source (official/community),
  //    skip the main menu prompt and do a direct download.
  if (source === "official" || source === "community") {
    const repoId =
      source === "official"
        ? "blefnk/awesome-cursor-rules"
        : "pontusab/directories";

    const [owner] = repoId.split("/");
    if (!owner) {
      relinka("error", "Invalid repository selection");
      return;
    }

    const filesToInstall = await downloadRules(repoId, isDev);
    if (filesToInstall.length === 0) {
      relinka("error", "No rule files found");
      return;
    }

    await installRules(filesToInstall, owner, cwd);
    relinka("success-verbose", "Rules installation completed");
    return; // Done, no further prompts
  }

  // 2. If we reach here, source === "prompt", so we do the interactive menu
  const hasInstalledMdc = await hasInstalledRules(cwd);
  const mainOptions: AddRuleMenuChoice[] = [
    "download-official",
    "download-community",
  ];

  if (hasInstalledMdc) {
    mainOptions.push("update", "manage");
  }

  const mainOption = await selectPrompt<AddRuleMenuChoice>({
    title: "AI IDE Rules",
    options: [
      {
        value: "download-official",
        label: "Download official",
        hint: "blefnk/awesome-cursor-rules",
      },
      {
        value: "download-community",
        label: "Download community",
        hint: "pontusab/directories",
      },
      ...(hasInstalledMdc
        ? [
            {
              value: "update" as const,
              label: "Update rules",
              hint: "Check and update installed rules",
            },
            {
              value: "manage" as const,
              label: "Manage installed rules",
              hint: "View or remove installed rules",
            },
          ]
        : []),
    ],
  });

  if (
    mainOption === "download-official" ||
    mainOption === "download-community"
  ) {
    const repoId =
      mainOption === "download-official"
        ? "blefnk/awesome-cursor-rules"
        : "pontusab/directories";

    const [owner] = repoId.split("/");
    if (!owner) {
      relinka("error", "Invalid repository selection");
      return;
    }

    // Always display the multiselect prompt for file selection
    const filesToInstall = await downloadRules(repoId, isDev);
    if (filesToInstall.length === 0) {
      relinka("error", "No rule files found");
      return;
    }

    await installRules(filesToInstall, owner, cwd);
    relinka("success-verbose", "Rules installation completed");
  } else if (mainOption === "update") {
    await handleRuleUpdates(cwd, isDev);
  } else if (mainOption === "manage") {
    const rulesDir = path.join(cwd, ".cursor", "rules");
    const files = await fs.readdir(rulesDir);
    const ruleFiles = files.filter(
      (file) => file.endsWith(".md") || file.endsWith(RULE_FILE_EXTENSION),
    );

    if (ruleFiles.length === 0) {
      relinka("info", "No rules installed");
      return;
    }

    const managementOption = await selectPrompt<"view" | "delete">({
      title: "Rule Management",
      options: [
        {
          value: "view",
          label: "View installed rules",
          hint: `${ruleFiles.length} rules installed`,
        },
        {
          value: "delete",
          label: "Delete rules",
          hint: "Remove installed rules",
        },
      ],
    });

    if (managementOption === "view") {
      relinka("success", "Installed rules:");
      for (const file of ruleFiles) {
        relinka("info", `  - ${path.basename(file)}`);
      }
    } else if (managementOption === "delete") {
      const filesToDelete = await multiselectPrompt({
        title: "Select rules to delete",
        displayInstructions: true,
        options: ruleFiles.map((file) => ({
          value: file,
          label: path.basename(file),
        })),
      });
      if (filesToDelete.length > 0) {
        const confirmed = await confirmPrompt({
          title: `Delete ${filesToDelete.length} rule(s)?`,
        });
        if (confirmed) {
          for (const file of filesToDelete) {
            await fs.remove(path.join(rulesDir, file));
          }
          relinka("success", `Deleted ${filesToDelete.length} rule(s)`);
        }
      }
    }
  }
}
