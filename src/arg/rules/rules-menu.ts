import {
  selectPrompt,
  multiselectPrompt,
  confirmPrompt,
} from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import { ofetch } from "ofetch";
import os from "os";
import path from "pathe";

import {
  RULES_REPOS,
  checkForRuleUpdates,
  checkRulesRepoUpdate,
  hasCursorRulesDir,
} from "./rules-utils.js";

// Download rules from the repository
async function downloadRules(
  repoId: string,
  isDev: boolean,
): Promise<string[]> {
  const [owner, repoName] = repoId.split("/");
  if (!owner || !repoName) return [];

  const homeDir = os.homedir();
  const repoCacheDir = path.join(homeDir, ".reliverse", "rules", owner);

  // Clear existing cache directory if it exists
  if (await fs.pathExists(repoCacheDir)) {
    await fs.remove(repoCacheDir);
  }

  // Create the cache directory
  await fs.ensureDir(repoCacheDir);

  relinka("info", `Downloading rules from ${repoId}...`);

  try {
    // Download repository content using GitHub API (tree)
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`;
    const repoData = await ofetch<{
      tree: { path: string; type: string; url: string }[];
    }>(apiUrl);

    // Filter for markdown files, excluding README.md
    const mdFiles = repoData.tree.filter(
      (item) =>
        item.type === "blob" &&
        item.path.endsWith(".md") &&
        item.path.toLowerCase() !== "readme.md",
    );

    // Download each file
    const downloadedFiles: string[] = [];
    for (const file of mdFiles) {
      try {
        const contentUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/main/${file.path}`;
        const content = await ofetch<string>(contentUrl, {
          responseType: "text" as any,
        });

        // Save the file to the cache directory
        const filePath = path.join(repoCacheDir, file.path);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);

        downloadedFiles.push(file.path);

        if (isDev) {
          relinka("info", `Downloaded ${file.path}`);
        }
      } catch (error) {
        relinka("error", `Failed to download ${file.path}: ${error}`);
      }
    }

    // Save the current date to track updates
    const currentDate = new Date().toISOString();
    await fs.writeFile(path.join(repoCacheDir, ".last_updated"), currentDate);

    relinka("success", `Downloaded ${downloadedFiles.length} rule files`);
    return downloadedFiles;
  } catch (error) {
    relinka("error", `Failed to download rules: ${error}`);
    return [];
  }
}

// Get cached rule files from the repository
async function getCachedRuleFiles(owner: string): Promise<string[]> {
  const homeDir = os.homedir();
  const repoCacheDir = path.join(homeDir, ".reliverse", "rules", owner);

  if (!(await fs.pathExists(repoCacheDir))) {
    return [];
  }

  try {
    const files = await fs.readdir(repoCacheDir, { recursive: true });
    // Filter and ensure all items are strings
    return (files as string[]).filter(
      (file) =>
        typeof file === "string" &&
        file.endsWith(".md") &&
        file.toLowerCase() !== "readme.md" &&
        !file.startsWith("."),
    );
  } catch (error) {
    relinka("error", `Failed to read cached rules: ${error}`);
    return [];
  }
}

// Install selected rules to the cursor rules directory
async function installRules(
  files: string[],
  owner: string,
  cwd: string,
): Promise<void> {
  const homeDir = os.homedir();
  const repoCacheDir = path.join(homeDir, ".reliverse", "rules", owner);
  const cursorRulesDir = path.join(cwd, ".cursor", "rules");

  // Create cursor rules directory if it doesn't exist
  await fs.ensureDir(cursorRulesDir);

  relinka("info", "Installing selected rules...");

  // Check existing files in the cursor rules directory
  const existingFiles = await fs.readdir(cursorRulesDir);
  let installedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const sourceFile = path.join(repoCacheDir, file);
    const baseFileName = path.basename(file, ".md");
    const targetFileName = `${baseFileName}.mdc`;
    const targetFile = path.join(cursorRulesDir, targetFileName);

    // Check if a file with the same name (either .md or .mdc) already exists
    const fileExists = existingFiles.some(
      (f) => f === targetFileName || f === `${baseFileName}.md`,
    );

    if (fileExists) {
      const shouldOverwrite = await confirmPrompt({
        title: `File ${targetFileName} already exists. Overwrite?`,
      });

      if (!shouldOverwrite) {
        relinka("info", `Skipping ${file}`);
        skippedCount++;
        continue;
      }
    }

    try {
      // Copy and rename the file from .md to .mdc
      await fs.copyFile(sourceFile, targetFile);
      installedCount++;
      if (files.length <= 5) {
        // Only show individual file success for small number of files
        relinka("success", `Installed ${targetFileName}`);
      }
    } catch (error) {
      relinka("error", `Failed to install ${file}: ${error}`);
    }
  }

  if (files.length > 5) {
    // Show summary for large number of files
    relinka("success", `Installed ${installedCount} rule files`);
  }

  if (skippedCount > 0) {
    relinka("info", `Skipped ${skippedCount} rule files`);
  }
}

// Handle checking for updates and updating rules
async function handleRuleUpdates(cwd: string, isDev: boolean): Promise<void> {
  const hasUpdates = await checkForRuleUpdates(isDev);

  if (hasUpdates) {
    relinka("info", "Rule updates are available!");

    const shouldDownload = await confirmPrompt({
      title: "Would you like to download the updates?",
    });

    if (shouldDownload) {
      // Show the rules menu to handle the download and installation
      await showRulesMenu({ cwd, isDev });
    }
  } else {
    relinka("info", "No rule updates available.");
  }
}

// Main menu handler for the rules command
export async function showRulesMenu({
  cwd,
  isDev,
}: {
  cwd: string;
  isDev: boolean;
}): Promise<void> {
  const homeDir = os.homedir();

  // Check if cursor rules directory exists
  const hasCursorRules = await hasCursorRulesDir(cwd);

  // Main menu options
  const menuChoices = ["Download AI IDE rules (Cursor, Windsurf, Copilot)"];

  type MenuChoice = "download" | "update" | "check-updates" | "exit";

  if (hasCursorRules) {
    menuChoices.push("Update existing rules");
    menuChoices.push("Check for rule updates");
  }

  const mainOption = await selectPrompt<MenuChoice>({
    title: "AI IDE Rules",
    options: menuChoices.map((choice) => ({
      value: choice as MenuChoice,
      label: choice,
    })),
  });

  if (mainOption === "download" || mainOption === "update") {
    // For now, we only have one repository
    const repoId = RULES_REPOS[0]?.id;
    const owner = RULES_REPOS[0]?.author;

    if (!repoId || !owner) {
      relinka("error", "No rule repositories configured");
      return;
    }

    const repoCacheDir = path.join(homeDir, ".reliverse", "rules", owner);

    // Check if we already have the repository cached
    const hasCache = await fs.pathExists(repoCacheDir);
    let filesToInstall: string[] = [];

    if (hasCache) {
      // Check for updates
      const hasUpdate = await checkRulesRepoUpdate(repoId);

      if (hasUpdate) {
        const shouldUpdate = await confirmPrompt({
          title: "An update is available. Download it?",
        });

        if (shouldUpdate) {
          filesToInstall = await downloadRules(repoId, isDev);
        } else {
          // Use existing files in the cache
          relinka("info", "Using cached rules (updates available)");
          filesToInstall = await getCachedRuleFiles(owner);
        }
      } else {
        relinka("info", "Using cached rules (no updates available)");
        // Use existing files in the cache
        filesToInstall = await getCachedRuleFiles(owner);
      }
    } else {
      // Download the repository
      filesToInstall = await downloadRules(repoId, isDev);
    }

    if (filesToInstall.length === 0) {
      relinka("error", "No rule files found");
      return;
    }

    // Sort files to make it easier to find specific ones
    filesToInstall.sort();

    // Let the user select which files to install
    const selectedFiles = await multiselectPrompt({
      title: "Select rules to install",
      options: filesToInstall.map((file) => ({
        value: file,
        label: path.basename(file, ".md"),
      })),
    });

    if (selectedFiles.length === 0) {
      relinka("info", "No files selected for installation");
      return;
    }

    // Install the selected files
    await installRules(selectedFiles, owner, cwd);
    relinka("success", "Rules installation completed");
  } else if (mainOption === "check-updates") {
    // Handle checking for updates
    await handleRuleUpdates(cwd, isDev);
  }
}
