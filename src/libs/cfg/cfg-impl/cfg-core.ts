import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";

import type { RseConfig } from "./cfg-types";

import {
  UNKNOWN_VALUE,
  RSE_SCHEMA_DEV,
  cliConfigJsonc,
  cliConfigTs,
} from "./cfg-consts";
import { createRseConfig } from "./cfg-create";
import { DEFAULT_CONFIG_RSE } from "./cfg-default";
import { getRseConfigPath } from "./cfg-path";
import { readRseConfig } from "./cfg-read";
import { parseAndFixRseConfig } from "./cfg-repair";

/* ------------------------------------------------------------------
 * The Core Logic: Handle or Verify Config + MULTI-CONFIG
 * ------------------------------------------------------------------
 */

/**
 * Retrieves or creates the main rseg (and any 'mrse' configs).
 * Allows an optional custom path to the TS config file.
 */
export async function getOrCreateRseConfig({
  projectPath,
  isDev,
  overrides,
  customTsconfigPath,
}: {
  projectPath: string;
  isDev: boolean;
  overrides: Partial<RseConfig>;
  customTsconfigPath?: string;
}): Promise<{ config: RseConfig; mrse: RseConfig[] }> {
  const githubUsername = UNKNOWN_VALUE;
  const mrseFolderPath = path.join(projectPath, ".config", "mrse");
  const results: RseConfig[] = [];

  // Collect additional configs in "mrse" folder
  if (await fs.pathExists(mrseFolderPath)) {
    const dirItems = await fs.readdir(mrseFolderPath);
    const rseFiles = dirItems.filter(
      (item) => item === cliConfigJsonc || item === cliConfigTs,
    );
    const configs = await Promise.all(
      rseFiles.map(async (file) => {
        const filePath = path.join(mrseFolderPath, file);
        let foundConfig = await readRseConfig(filePath, isDev);
        if (!foundConfig) {
          foundConfig = await parseAndFixRseConfig(filePath, isDev);
        }
        if (!foundConfig) {
          relinka("warn", `Skipping invalid config file: ${filePath}`);
        }
        return foundConfig;
      }),
    );
    results.push(
      ...configs.filter(
        (cfg: RseConfig | null): cfg is RseConfig => cfg !== null,
      ),
    );
  }

  // Retrieve the path to the main rseg
  const { configPath } = await getRseConfigPath(
    projectPath,
    isDev,
    false,
    customTsconfigPath,
  );

  // Ensure a config file exists
  if (!(await fs.pathExists(configPath))) {
    await createRseConfig(projectPath, githubUsername, isDev, overrides);
  } else {
    // Check if the file is empty or has only "{}"
    const content = (await fs.readFile(configPath, "utf-8")).trim();
    if (!content || content === "{}") {
      await createRseConfig(projectPath, githubUsername, isDev, overrides);
    } else {
      // If the existing config is invalid, attempt to fix it
      const validConfig = await readRseConfig(configPath, isDev);
      if (!validConfig) {
        const fixed = await parseAndFixRseConfig(configPath, isDev);
        if (!fixed) {
          relinka(
            "warn",
            "Could not fix existing config. Using fallback defaults.",
          );
        }
      }
    }
  }

  // Final read
  const mainConfig = await readRseConfig(configPath, isDev);
  if (!mainConfig) {
    relinka("warn", "Using fallback default config due to validation failure.");
    return { config: { ...DEFAULT_CONFIG_RSE }, mrse: results };
  }
  if (isDev) {
    mainConfig.$schema = RSE_SCHEMA_DEV;
  }

  return { config: mainConfig, mrse: results };
}
