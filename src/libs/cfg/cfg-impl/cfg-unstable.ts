import { Value } from "@sinclair/typebox/value";
import { loadConfig, watchConfig } from "c12";

import type { RseConfig } from "./cfg-types";

import { DEFAULT_CONFIG_RSE } from "./cfg-default";
import { rseSchema } from "./cfg-schema";

/**
 * Loads the rse config using c12. Merges:
 * 1) File named `rse.*`
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
    configFile: "rse", // will look for files like `.config/rse.{ts,jsonc}`
    rcFile: false,
    packageJson: false,
    dotenv: false, // disable loading .env
    defaults: DEFAULT_CONFIG_RSE, // merged first
    // overrides: overrides || {}, // highest priority
  });

  // Basic TypeBox validation
  if (!Value.Check(rseSchema, config)) {
    const errors = [...Value.Errors(rseSchema, config)].map(
      (err) => `Path "${err.path}": ${err.message}`,
    );
    throw new Error(`Invalid rse config:\n${errors.join("\n")}`);
  }
  return config;
}

/**
 * Watches the rse config for changes and reloads on each update.
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
