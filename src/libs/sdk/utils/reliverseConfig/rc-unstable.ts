import { Value } from "@sinclair/typebox/value";
import { loadConfig, watchConfig } from "c12";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";

import { reliverseConfigSchema } from "~/libs/cfg/constants/cfg-schema.js";

import { DEFAULT_CONFIG } from "./rc-const.js";

/**
 * Loads the Reliverse config using c12. Merges:
 * 1) File named `reliverse.config.*`
 * 2) Optional overrides
 */
export async function loadReliverseConfig(
  projectPath: string,
  //   overrides?: Partial<ReliverseConfig>,
): Promise<ReliverseConfig> {
  // c12 automatically detects supported file types (.ts, .js, .jsonc, etc.)
  const { config } = await loadConfig<ReliverseConfig>({
    cwd: projectPath,
    name: "reliverse", // configuration base name
    configFile: "reliverse.config", // will look for files like `reliverse.config.ts`
    rcFile: false,
    packageJson: false,
    dotenv: false, // disable loading .env
    defaults: DEFAULT_CONFIG, // merged first
    // overrides: overrides || {}, // highest priority
  });

  // Basic TypeBox validation
  if (!Value.Check(reliverseConfigSchema, config)) {
    const errors = [...Value.Errors(reliverseConfigSchema, config)].map(
      (err) => `Path "${err.path}": ${err.message}`,
    );
    throw new Error(`Invalid Reliverse config:\n${errors.join("\n")}`);
  }
  return config;
}

/**
 * Watches the Reliverse config for changes and reloads on each update.
 */
export async function watchReliverseConfig(
  projectPath: string,
  onUpdate: (newConfig: ReliverseConfig) => void,
): Promise<void> {
  const watcher = await watchConfig<ReliverseConfig>({
    cwd: projectPath,
    name: "reliverse",
    onUpdate({ newConfig, getDiff }) {
      if (!Value.Check(reliverseConfigSchema, newConfig)) {
        return;
      }
      // Any changes are inspected via getDiff()
      onUpdate(newConfig);
      console.log("Diff:", getDiff());
    },
  });

  // Logs all files that are being watched
  console.log("Watching config:", watcher.watchingFiles);
}
