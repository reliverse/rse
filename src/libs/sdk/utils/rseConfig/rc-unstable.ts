import { Value } from "@sinclair/typebox/value";
import { loadConfig, watchConfig } from "c12";

import type { RseConfig } from "~/libs/sdk/utils/rseConfig/cfg-types.js";

import { rseSchema } from "~/libs/sdk/utils/rseConfig/cfg-schema.js";

import { DEFAULT_CONFIG } from "./rc-const.js";

/**
 * Loads the rseg using c12. Merges:
 * 1) File named `rseg.*`
 * 2) Optional overrides
 */
export async function loadrse(
  projectPath: string,
  //   overrides?: Partial<RseConfig>,
): Promise<RseConfig> {
  // c12 automatically detects supported file types (.ts, .js, .jsonc, etc.)
  const { config } = await loadConfig<RseConfig>({
    cwd: projectPath,
    name: "rse",
    configFile: "rseg", // will look for files like `rse.config`
    rcFile: false,
    packageJson: false,
    dotenv: false, // disable loading .env
    defaults: DEFAULT_CONFIG, // merged first
    // overrides: overrides || {}, // highest priority
  });

  // Basic TypeBox validation
  if (!Value.Check(rseSchema, config)) {
    const errors = [...Value.Errors(rseSchema, config)].map(
      (err) => `Path "${err.path}": ${err.message}`,
    );
    throw new Error(`Invalid rseg:\n${errors.join("\n")}`);
  }
  return config;
}

/**
 * Watches the rseg for changes and reloads on each update.
 */
export async function watchrse(
  projectPath: string,
  onUpdate: (newconfig: RseConfig) => void,
): Promise<void> {
  const watcher = await watchConfig<RseConfig>({
    cwd: projectPath,
    name: "rse",
    onUpdate({ newConfig, getDiff }) {
      if (!Value.Check(rseSchema, newConfig)) {
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
