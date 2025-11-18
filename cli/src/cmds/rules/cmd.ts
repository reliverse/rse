import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { defineArgs, defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import {
  confirmPrompt,
  exitCancelled,
  isCancel,
  multiselectPrompt,
} from "@reliverse/dler-prompt";
import { bootstrap, getAvailableFiles } from "@reliverse/rse-rules";

const FILE_TO_AGENTS_MAP: Record<string, string[]> = {
  "AGENTS.md": [
    "GitHub Copilot",
    "OpenAI Codex CLI",
    "Jules",
    "Amp",
    "Aider",
    "Gemini CLI",
    "OpenCode",
    "Qwen Code",
    "RooCode",
  ],
  "CLAUDE.md": ["Claude Code"],
  "CRUSH.md": ["Crush"],
  "WARP.md": ["Warp"],
  ".clinerules": ["Cline"],
  ".aider.conf.yml": ["Aider"],
  ".amazonq/rules/ruler_q_rules.md": ["Amazon Q CLI"],
  ".idx/airules.md": ["Firebase Studio"],
  ".openhands/microagents/repo.md": ["Open Hands"],
  ".junie/guidelines.md": ["Junie"],
  ".augment/rules/ruler_augment_instructions.md": ["AugmentCode"],
  ".kilocode/rules/ruler_kilocode_instructions.md": ["Kilo Code"],
  "opencode.json": ["OpenCode"],
  ".goosehints": ["Goose"],
  ".trae/rules/project_rules.md": ["Trae AI"],
  ".kiro/steering/ruler_kiro_instructions.md": ["Kiro"],
  "firebender.json": ["Firebender"],
};

const DIRECTORY_TO_AGENTS_MAP: Record<string, string[]> = {
  ".cursor": ["Cursor"],
  ".claude": ["Claude Code"],
  ".codex": ["OpenAI Codex CLI"],
  ".ruler": ["Ruler"],
  ".windsurf": ["Windsurf"],
  ".zed": ["Zed"],
};

function buildProviderToFilesMap(): Map<string, string[]> {
  const providerMap = new Map<string, string[]>();

  for (const [file, agents] of Object.entries(FILE_TO_AGENTS_MAP)) {
    for (const agent of agents) {
      const existing = providerMap.get(agent) ?? [];
      if (!existing.includes(file)) {
        existing.push(file);
      }
      providerMap.set(agent, existing);
    }
  }

  for (const [directory, agents] of Object.entries(DIRECTORY_TO_AGENTS_MAP)) {
    for (const agent of agents) {
      const existing = providerMap.get(agent) ?? [];
      if (!existing.includes(directory)) {
        existing.push(directory);
      }
      providerMap.set(agent, existing);
    }
  }

  return providerMap;
}

function getSelectedProviders(
  providerMap: Map<string, string[]>,
  providersArg?: string,
): string[] {
  if (providersArg) {
    const csvProviders = providersArg
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const validProviders: string[] = [];
    const allProviders = Array.from(providerMap.keys());

    for (const provider of csvProviders) {
      if (allProviders.includes(provider)) {
        validProviders.push(provider);
      } else {
        logger.warn(`Unknown provider: ${provider}`);
      }
    }

    return validProviders;
  }

  return [];
}

function findExistingBackupFiles(
  selectedFiles: string[],
  outputDir: string,
): string[] {
  const backupFiles: string[] = [];
  for (const file of selectedFiles) {
    const relPath = file.slice(0, -3);
    const outputFile = resolve(outputDir, relPath);
    const backupFile = `${outputFile}.bak`;
    if (existsSync(backupFile)) {
      backupFiles.push(relative(outputDir, backupFile));
    }
  }
  return backupFiles;
}

function isPathCoveredByDirectory(
  filePath: string,
  directories: string[],
): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/");
  for (const dir of directories) {
    const normalizedDir = dir.replace(/\\/g, "/");
    // Check if file is inside directory (with trailing slash to avoid partial matches)
    if (
      normalizedPath.startsWith(`${normalizedDir}/`) ||
      normalizedPath === normalizedDir
    ) {
      return true;
    }
  }
  return false;
}

async function ensureGitignoreEntries(
  installedFiles: string[],
  projectRoot: string,
  selectedProviders: string[],
): Promise<void> {
  const gitignorePath = `${projectRoot}/.gitignore`;

  let gitignoreContent = "";
  if (existsSync(gitignorePath)) {
    gitignoreContent = await readFile(gitignorePath, "utf-8");
  }

  const existingEntries = new Set(
    gitignoreContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#")),
  );

  // Collect all directory entries (existing + new)
  const allDirectories: string[] = [];
  for (const entry of existingEntries) {
    // Check if entry is a directory (ends with / or is a known directory)
    if (entry.endsWith("/") || DIRECTORY_TO_AGENTS_MAP[entry]) {
      allDirectories.push(entry.replace(/\/$/, ""));
    }
  }

  const newEntries: string[] = [];

  // Collect directories to add based on selected providers
  for (const provider of selectedProviders) {
    for (const [directory, agents] of Object.entries(DIRECTORY_TO_AGENTS_MAP)) {
      if (agents.includes(provider) && !existingEntries.has(directory)) {
        newEntries.push(directory);
        existingEntries.add(directory);
        allDirectories.push(directory);
      }
    }
  }

  // Add installed files to gitignore (skip if covered by a directory)
  if (installedFiles.length > 0) {
    const relativePaths = installedFiles
      .map((file) => {
        const relPath = relative(projectRoot, file);
        return relPath.startsWith("..") ? null : relPath;
      })
      .filter((path): path is string => path !== null);

    for (const path of relativePaths) {
      // Skip if already exists or is covered by a directory
      if (
        !existingEntries.has(path) &&
        !isPathCoveredByDirectory(path, allDirectories)
      ) {
        newEntries.push(path);
        existingEntries.add(path);
      }
    }
  }

  if (!existingEntries.has("*.bak")) {
    newEntries.push("*.bak");
  }

  if (newEntries.length > 0) {
    const entriesToAdd = newEntries.join("\n");
    const updatedContent =
      gitignoreContent.trim().length > 0
        ? `${gitignoreContent.trim()}\n${entriesToAdd}\n`
        : `${entriesToAdd}\n`;

    await writeFile(gitignorePath, updatedContent, "utf-8");
    logger.info(`Added ${newEntries.length} entry/entries to .gitignore`);
  }
}

export default defineCommand({
  meta: {
    name: "rules",
    description:
      "Bootstrap AI rules by converting escaped TypeScript files to their original format",
    examples: [
      "rules",
      'rules --providers "Cursor,Claude Code"',
      'rules --providers "GitHub Copilot"',
      'rules --cwd "./my-project"',
      'rules --providers "Cursor" --cwd "./my-project"',
      'rules --providers "Cursor" --force',
      'rules --providers "Cursor" --backup false',
      'rules --providers "Cursor" --verbose',
    ],
  },
  args: defineArgs({
    providers: {
      type: "string",
      description: "Comma-separated list of providers to install rules for",
    },
    cwd: {
      type: "string",
      description: "Working directory where rules will be installed",
    },
    force: {
      type: "boolean",
      description: "Skip confirmation prompt when .bak files exist",
    },
    backup: {
      type: "boolean",
      description: "Create backup files when overwriting (default: true)",
    },
    verbose: {
      type: "boolean",
      description: "Display detailed information including absolute paths",
    },
  }),
  run: async ({ args }) => {
    logger.info("Discovering available AI rules...");

    try {
      const availableFiles = await getAvailableFiles();
      const availableFilesSet = new Set(availableFiles);

      if (availableFiles.length === 0) {
        logger.warn("No rule files found to install.");
        return;
      }

      const providerMap = buildProviderToFilesMap();
      const allProviders = Array.from(providerMap.keys()).sort();

      let selectedProviders: string[];

      if (args.providers) {
        selectedProviders = getSelectedProviders(providerMap, args.providers);
        if (selectedProviders.length === 0) {
          logger.warn("No valid providers found in --providers argument.");
          return;
        }
      } else {
        const options = allProviders.map((provider) => ({
          value: provider,
          label: provider, // what the user sees
        }));

        const multiselectResult = await multiselectPrompt({
          message: "Select providers to install rules for: ",
          options: options.map(({ value, label }) => ({ value, label })),
          footerText: "Space: toggle, Enter: confirm",
        });

        if (isCancel(multiselectResult)) {
          exitCancelled("Selection cancelled or error occurred");
        }

        if (multiselectResult.length === 0) {
          logger.warn("No providers selected. Exiting.");
          return;
        }

        selectedProviders = multiselectResult
          .map((value) => value)
          .filter((value): value is string => value !== undefined);
      }

      const selectedFilesSet = new Set<string>();

      for (const provider of selectedProviders) {
        const allFilesForProvider = providerMap.get(provider) ?? [];
        for (const file of allFilesForProvider) {
          const fileWithExtTs = `${file}.ts`;
          const fileWithExtJs = `${file}.js`;
          if (availableFilesSet.has(fileWithExtTs)) {
            selectedFilesSet.add(fileWithExtTs);
          }
          if (availableFilesSet.has(fileWithExtJs)) {
            selectedFilesSet.add(fileWithExtJs);
          }
        }

        for (const [directory, agents] of Object.entries(
          DIRECTORY_TO_AGENTS_MAP,
        )) {
          if (agents.includes(provider)) {
            for (const availableFile of availableFiles) {
              const normalizedFile = availableFile.replace(/\\/g, "/");
              const normalizedDir = directory.replace(/\\/g, "/");
              if (
                normalizedFile === `${normalizedDir}.ts` ||
                normalizedFile === `${normalizedDir}.js` ||
                normalizedFile.startsWith(`${normalizedDir}/`)
              ) {
                selectedFilesSet.add(availableFile);
              }
            }
          }
        }
      }

      const selectedFiles = Array.from(selectedFilesSet);

      if (selectedFiles.length === 0) {
        logger.warn("No available rules selected. Exiting.");
        return;
      }

      const outputDir = args.cwd ? resolve(args.cwd) : process.cwd();
      const shouldBackup = args.backup !== false;

      if (shouldBackup) {
        const existingBackupFiles = findExistingBackupFiles(
          selectedFiles,
          outputDir,
        );
        if (existingBackupFiles.length > 0 && !args.force) {
          logger.warn(
            `Found ${existingBackupFiles.length} existing .bak file(s) that will be overwritten:`,
          );
          for (const backupFile of existingBackupFiles.slice(0, 5)) {
            logger.warn(`  - ${backupFile}`);
          }
          if (existingBackupFiles.length > 5) {
            logger.warn(`  ... and ${existingBackupFiles.length - 5} more`);
          }

          const confirmResult = await confirmPrompt({
            message: "Are you sure you want to overwrite these .bak files?",
            footerText: "Y: confirm, N: cancel",
          });

          if (isCancel(confirmResult)) {
            exitCancelled("Confirmation cancelled or error occurred");
          }

          if (!confirmResult) {
            exitCancelled("Operation cancelled by user.");
          }
        }
      }

      logger.info(
        `Bootstrapping ${selectedFiles.length} selected rule file(s)...`,
      );

      if (args.verbose) {
        for (const file of selectedFiles) {
          const fileWithoutExt = file.replace(/\.(ts|js)$/, "");
          const absolutePath = resolve(outputDir, fileWithoutExt);
          logger.info(`  - ${absolutePath}`);
        }
      }

      const files = await bootstrap(selectedFiles, outputDir, {
        backup: shouldBackup,
      });
      logger.info(`Successfully bootstrapped ${files.length} rule file(s):`);
      for (const file of files) {
        const relPath = relative(outputDir, file);
        logger.info(`  - ${relPath}`);
      }

      await ensureGitignoreEntries(files, outputDir, selectedProviders);
      logger.info("AI rules are ready to use!");
    } catch (error) {
      logger.error("Failed to bootstrap AI rules:", error);
      throw error;
    }
  },
});
