import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import path from "pathe";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";

import {
  UNKNOWN_VALUE,
  RELIVERSE_SCHEMA_DEV,
  cliConfigJsonc,
  cliConfigTs,
} from "~/libs/cfg/constants/cfg-details.js";

import { DEFAULT_CONFIG } from "./rc-const.js";
import { createReliverseConfig } from "./rc-create.js";
import { getReliverseConfigPath } from "./rc-path.js";
import { readReliverseConfig } from "./rc-read.js";
import { parseAndFixReliverseConfig } from "./rc-repair.js";

/* ------------------------------------------------------------------
 * The Core Logic: Handle or Verify Config + MULTI-CONFIG
 * ------------------------------------------------------------------
 */

/**
 * Retrieves or creates the main Reliverse config (and any 'multireli' configs).
 * Allows an optional custom path to the TS config file.
 */
export async function getReliverseConfig(
  projectPath: string,
  isDev: boolean,
  overrides: Partial<ReliverseConfig>,
  customTsconfigPath?: string,
): Promise<{ config: ReliverseConfig; multireli: ReliverseConfig[] }> {
  const githubUsername = UNKNOWN_VALUE;
  const multireliFolderPath = path.join(projectPath, "multireli");
  const results: ReliverseConfig[] = [];

  // Collect additional configs in "multireli" folder
  if (await fs.pathExists(multireliFolderPath)) {
    const dirItems = await fs.readdir(multireliFolderPath);
    const reliverseFiles = dirItems.filter(
      (item) => item === cliConfigJsonc || item === cliConfigTs,
    );
    const configs = await Promise.all(
      reliverseFiles.map(async (file) => {
        const filePath = path.join(multireliFolderPath, file);
        let foundConfig = await readReliverseConfig(filePath, isDev);
        if (!foundConfig) {
          foundConfig = await parseAndFixReliverseConfig(filePath, isDev);
        }
        if (!foundConfig) {
          relinka("warn", `Skipping invalid config file: ${filePath}`);
        }
        return foundConfig;
      }),
    );
    results.push(
      ...configs.filter((cfg): cfg is ReliverseConfig => cfg !== null),
    );
  }

  // Retrieve the path to the main Reliverse config
  const { configPath } = await getReliverseConfigPath(
    projectPath,
    isDev,
    false,
    customTsconfigPath,
  );

  // Ensure a config file exists
  if (!(await fs.pathExists(configPath))) {
    await createReliverseConfig(projectPath, githubUsername, isDev, overrides);
  } else {
    // Check if the file is empty or has only "{}"
    const content = (await fs.readFile(configPath, "utf-8")).trim();
    if (!content || content === "{}") {
      await createReliverseConfig(
        projectPath,
        githubUsername,
        isDev,
        overrides,
      );
    } else {
      // If the existing config is invalid, attempt to fix it
      const validConfig = await readReliverseConfig(configPath, isDev);
      if (!validConfig) {
        const fixed = await parseAndFixReliverseConfig(configPath, isDev);
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
  const mainConfig = await readReliverseConfig(configPath, isDev);
  if (!mainConfig) {
    relinka("warn", "Using fallback default config due to validation failure.");
    return { config: { ...DEFAULT_CONFIG }, multireli: results };
  }
  if (isDev) {
    mainConfig.$schema = RELIVERSE_SCHEMA_DEV;
  }

  return { config: mainConfig, multireli: results };
}
