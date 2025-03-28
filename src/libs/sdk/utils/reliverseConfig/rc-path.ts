/* ------------------------------------------------------------------
 * Path Helpers
 * ------------------------------------------------------------------
 */

import { tsconfigJson } from "@reliverse/relidler-sdk";
import fs from "fs-extra";
import path from "pathe";

import { cliConfigTs, cliConfigJsonc } from "~/libs/cfg/cfg-main.js";
import { askReliverseConfigType } from "~/libs/sdk/utils/prompts/askReliverseConfigType.js";

// Cache the result per project path so the prompt is only shown once.
const configPathCache = new Map<
  string,
  { configPath: string; isTS: boolean }
>();

/**
 * Determines the Reliverse config file path and whether it's TS or JSONC.
 * - In dev mode, automatically selects the TS path.
 * - Honors a custom tsconfig.json path if provided.
 * - Caches results by projectPath.
 */
export async function getReliverseConfigPath(
  projectPath: string,
  isDev: boolean,
  skipPrompt: boolean,
  customTsconfigPath?: string,
): Promise<{ configPath: string; isTS: boolean }> {
  // Dev mode: always choose .ts config in the project root
  if (isDev) {
    const devResult = {
      configPath: path.join(projectPath, cliConfigTs),
      isTS: true,
    };
    configPathCache.set(projectPath, devResult);
    return devResult;
  }

  // Return cached if available
  const cached = configPathCache.get(projectPath);
  if (cached) {
    return cached;
  }

  // Use the custom TS config path if provided, otherwise default to "tsconfig.json"
  const finalTsconfigPath = customTsconfigPath
    ? path.resolve(customTsconfigPath)
    : path.join(projectPath, tsconfigJson);

  // Identify potential config paths
  const reliverseJsoncPath = path.join(projectPath, cliConfigJsonc);
  const reliverseTsPath = path.join(projectPath, cliConfigTs);

  // Check if these paths exist
  const [tsconfigExists, jsoncExists, tsExists] = await Promise.all([
    fs.pathExists(finalTsconfigPath),
    fs.pathExists(reliverseJsoncPath),
    fs.pathExists(reliverseTsPath),
  ]);

  let result: { configPath: string; isTS: boolean };

  // If an existing .ts config is present
  if (tsExists) {
    result = { configPath: reliverseTsPath, isTS: true };
  }
  // If no config yet, user has a tsconfig, and skipPrompt is false, ask which type to create
  else if (tsconfigExists && !jsoncExists && !skipPrompt) {
    const choice = await askReliverseConfigType();
    result =
      choice === "ts"
        ? { configPath: reliverseTsPath, isTS: true }
        : { configPath: reliverseJsoncPath, isTS: false };
  } else {
    // Default to JSONC
    result = { configPath: reliverseJsoncPath, isTS: false };
  }

  configPathCache.set(projectPath, result);
  return result;
}
