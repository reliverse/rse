import path from "@reliverse/pathkit";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { destr } from "destr";
import { execaCommand } from "execa";

import type { DeploymentService, VSCodeSettings } from "./cfg-types";

import { CONFIG_CATEGORIES, UNKNOWN_VALUE } from "./cfg-consts";
import { generateRseConfig } from "./cfg-create";
import { getRseConfigPath } from "./cfg-path";

// ------------------------------------------------------------------
// Helper Functions for Additional Config Files
// ------------------------------------------------------------------

async function generateBiomeConfig(projectPath: string): Promise<void> {
  const biomePath = path.join(projectPath, "biome.json");
  const biomeExists = await fs.pathExists(biomePath);
  if (!biomeExists) {
    await execaCommand("bunx biome init", {
      cwd: projectPath,
      stdio: "inherit",
    });
    relinka("verbose", "Generated biome.json");
  }
}

async function generateVSCodeSettings(
  projectPath: string,
  overwrite: boolean,
): Promise<void> {
  const vscodePath = path.join(projectPath, ".vscode");
  await ensuredir(vscodePath);

  const settingsPath = path.join(vscodePath, "settings.json");
  const defaultSettings: VSCodeSettings = {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "biomejs.biome",
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.addMissingImports": "never",
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "never",
      "source.removeUnused": "never",
    },
    "eslint.ignoreUntitled": true,
    "eslint.rules.customizations": [
      {
        rule: "perfectionist/sort-imports",
        severity: "off",
      },
    ],
    "markdownlint.config": {
      MD033: false,
    },
    "typescript.enablePromptUseWorkspaceTsdk": true,
  };

  let settings = { ...defaultSettings };

  if (!overwrite && (await fs.pathExists(settingsPath))) {
    try {
      const content = await fs.readFile(settingsPath, "utf-8");
      const existingSettings = destr(content);
      if (existingSettings && typeof existingSettings === "object") {
        const defaultCodeActions: VSCodeSettings["editor.codeActionsOnSave"] = {
          "quickfix.biome": "explicit",
          "source.addMissingImports": "never",
          "source.fixAll.eslint": "explicit",
          "source.organizeImports": "never",
          "source.removeUnused": "never",
        };
        const existingCodeActions = {
          ...defaultCodeActions,
          ...((existingSettings as Record<string, unknown>)[
            "editor.codeActionsOnSave"
          ] as typeof defaultCodeActions),
        };
        settings = {
          ...defaultSettings,
          ...existingSettings,
          "editor.codeActionsOnSave": existingCodeActions,
        };
      }
    } catch (error) {
      relinka(
        "verbose",
        "Error reading existing settings.json, creating new one",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  relinka(
    "verbose",
    overwrite
      ? "Generated brand new VSCode settings.json file"
      : "Updated VSCode settings.json with required settings",
  );
}

// ------------------------------------------------------------------
// Main Config Files Generation
// ------------------------------------------------------------------

export async function generateConfigFiles(
  projectPath: string,
  overwrite: boolean,
  projectName: string,
  deployService: DeploymentService,
  primaryDomain: string,
  frontendUsername: string,
  enableI18n: boolean,
  isDev: boolean,
  filesToGenerate: string[] = [],
): Promise<void> {
  try {
    const shouldGenerateFile = (filename: string): boolean => {
      return filesToGenerate.length === 0 || filesToGenerate.includes(filename);
    };

    // Clean up domain format
    const cleanDomain = primaryDomain
      .replace(/^https?:\/\//, "") // Remove protocol
      .replace(/\/.*$/, ""); // Remove any trailing path

    const finalFrontendUsername =
      isDev && frontendUsername === "blefnk" ? "reliverse" : frontendUsername;

    // Determine the active config file name.
    const configInfo = await getRseConfigPath(projectPath, isDev, false);
    const mainConfigFileName = path.basename(configInfo.configPath);

    // The rseg generation
    const configGenerators: Record<string, () => Promise<boolean>> = {
      [mainConfigFileName]: async () => {
        await generateRseConfig({
          projectName,
          frontendUsername:
            !finalFrontendUsername || finalFrontendUsername.trim() === ""
              ? UNKNOWN_VALUE
              : finalFrontendUsername,
          deployService,
          primaryDomain: cleanDomain,
          projectPath,
          githubUsername: UNKNOWN_VALUE,
          enableI18n,
          overwrite,
          isDev,
          configInfo,
          ...(isDev && configInfo?.isTS
            ? {
                customPathToTypes: "./src/libs/sdk/sdk-mod",
              }
            : {}),
          overrides: {},
        });
        return true;
      },
      "biome.json": async () => {
        await generateBiomeConfig(projectPath);
        return true;
      },
      "settings.json": async () => {
        await generateVSCodeSettings(projectPath, overwrite);
        return true;
      },
    };

    const generatedFiles: string[] = [];
    await Promise.all(
      Object.entries(configGenerators)
        .filter(([filename]) => shouldGenerateFile(filename))
        .map(async ([filename, generator]) => {
          const wasGenerated = await generator();
          if (wasGenerated) {
            generatedFiles.push(filename);
          }
        }),
    );

    if (generatedFiles.length > 0) {
      relinka(
        "verbose",
        `Generated configuration files: ${generatedFiles.join(", ")}`,
      );
    }
  } catch (error) {
    relinka(
      "error",
      "Error generating config files:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

export async function generateProjectConfigs(
  projectPath: string,
  projectName: string,
  frontendUsername: string,
  deployService: DeploymentService,
  primaryDomain: string,
  enableI18n: boolean,
  isDev: boolean,
): Promise<void> {
  try {
    // Check which files exist based on categories defined in CONFIG_CATEGORIES.
    const existingFiles: string[] = [];
    for (const category of Object.keys(CONFIG_CATEGORIES)) {
      const files =
        CONFIG_CATEGORIES[category as keyof typeof CONFIG_CATEGORIES];
      for (const file of files) {
        const filePath = path.join(projectPath, file);
        if (await fs.pathExists(filePath)) {
          existingFiles.push(file);
        }
      }
    }

    if (existingFiles.length > 0) {
      relinka(
        "verbose",
        `Found ${existingFiles.length} existing configuration files`,
      );
      // Generate missing files without overwriting existing ones
      await generateConfigFiles(
        projectPath,
        false,
        projectName,
        deployService,
        primaryDomain,
        frontendUsername,
        enableI18n,
        isDev,
      );
    } else {
      // No existing files, generate everything
      await generateConfigFiles(
        projectPath,
        true,
        projectName,
        deployService,
        primaryDomain,
        frontendUsername,
        enableI18n,
        isDev,
      );
    }
  } catch (error) {
    relinka(
      "error",
      `Failed to set up configuration files: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}
