/* ------------------------------------------------------------------
 * Path Helpers
 * ------------------------------------------------------------------
 */

import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";

import { tsconfigJson } from "./cfg-consts";
import { askRseConfigType } from "./cfg-prompts";

// Cache the result per project path so the prompt is only shown once.
const configPathCache = new Map<
  string,
  { configPath: string; isTS: boolean }
>();

/**
 * Determines the rse config file path and whether it's TS or JSONC.
 * Always looks in the .config directory first.
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
  // Return cached if available
  const cached = configPathCache.get(projectPath);
  if (cached) {
    return cached;
  }

  // Use the custom TS config path if provided, otherwise default to "tsconfig.json"
  const finalTsconfigPath = customTsconfigPath
    ? path.resolve(customTsconfigPath)
    : path.join(projectPath, tsconfigJson);

  // Identify potential config paths in .config directory
  const configDir = path.join(projectPath, ".config");
  const rseJsonc = path.join(configDir, "rse.jsonc");
  const rseTs = path.join(configDir, "rse.ts");

  // Check if these paths exist
  const [tsconfigExists, jsoncExists, tsExists] = await Promise.all([
    fs.pathExists(finalTsconfigPath),
    fs.pathExists(rseJsonc),
    fs.pathExists(rseTs),
  ]);

  let result: { configPath: string; isTS: boolean };

  // Dev mode: always choose .ts config
  if (isDev) {
    result = { configPath: rseTs, isTS: true };
  }
  // If an existing .ts config is present
  else if (tsExists) {
    result = { configPath: rseTs, isTS: true };
  }
  // If no config yet, user has a tsconfig, and skipPrompt is false, ask which type to create
  else if (tsconfigExists && !jsoncExists && !skipPrompt) {
    const choice = await askRseConfigType();
    result =
      choice === "ts"
        ? { configPath: rseTs, isTS: true }
        : { configPath: rseJsonc, isTS: false };
  } else {
    // Default to JSONC
    result = { configPath: rseJsonc, isTS: false };
  }

  configPathCache.set(projectPath, result);
  return result;
}
