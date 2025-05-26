/* ------------------------------------------------------------------
 * Path Helpers
 * ------------------------------------------------------------------
 */

import { tsconfigJson } from "@reliverse/dler-sdk";
import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";

import { askRseConfigType } from "~/libs/sdk/utils/prompts/askRseConfigType";

import { cliConfigTs, cliConfigJsonc } from "./cfg-details";

// Cache the result per project path so the prompt is only shown once.
const configPathCache = new Map<
  string,
  { configPath: string; isTS: boolean }
>();

/**
 * Determines the rse config file path and whether it's TS or JSONC.
 * - In dev mode, automatically selects the TS path.
 * - Honors a custom tsconfig.json path if provided.
 * - Caches results by projectPath.
 */
export async function getRseConfigPath(
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
  const rseath = path.join(projectPath, cliConfigJsonc);
  const rse = path.join(projectPath, cliConfigTs);

  // Check if these paths exist
  const [tsconfigExists, jsoncExists, tsExists] = await Promise.all([
    fs.pathExists(finalTsconfigPath),
    fs.pathExists(rseath),
    fs.pathExists(rse),
  ]);

  let result: { configPath: string; isTS: boolean };

  // If an existing .ts config is present
  if (tsExists) {
    result = { configPath: rse, isTS: true };
  }
  // If no config yet, user has a tsconfig, and skipPrompt is false, ask which type to create
  else if (tsconfigExists && !jsoncExists && !skipPrompt) {
    const choice = await askRseConfigType();
    result =
      choice === "ts"
        ? { configPath: rse, isTS: true }
        : { configPath: rseath, isTS: false };
  } else {
    // Default to JSONC
    result = { configPath: rseath, isTS: false };
  }

  configPathCache.set(projectPath, result);
  return result;
}
