/* ------------------------------------------------------------------
 * Update Project Config
 * ------------------------------------------------------------------
 */

import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { Value } from "@sinclair/typebox/value";
import { parseJSONC } from "confbox";

import { rseSchema } from "./cfg-schema";
import { type RseConfig } from "./cfg-types";
import { DEFAULT_CONFIG } from "./rc-const";
import { writeRseConfig } from "./rc-create";
import { getRseConfigPath } from "./rc-path";
import { getBackupAndTempPaths } from "./rc-utils";

/**
 * Deep merges two objects recursively while preserving nested structures.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };
  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const sourceValue = source[key];
    const targetValue = target[key];
    if (sourceValue !== undefined) {
      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  return result;
}

/**
 * Updates project configuration by merging new updates with the existing config.
 * Creates a backup before overwriting and attempts to restore from backup on error.
 */
export async function updateRseConfig(
  projectPath: string,
  updates: Partial<RseConfig>,
  isDev: boolean,
): Promise<boolean> {
  const { configPath } = await getRseConfigPath(projectPath, isDev, false);
  const { backupPath, tempPath } = getBackupAndTempPaths(configPath);

  try {
    let existingConfig: RseConfig = {} as RseConfig;
    if (await fs.pathExists(configPath)) {
      const existingContent = await fs.readFile(configPath, "utf-8");
      const parsed = parseJSONC(existingContent);
      if (Value.Check(rseSchema, parsed)) {
        existingConfig = parsed;
      } else {
        relinka("warn", "Invalid config schema, starting fresh");
      }
    }

    const mergedConfig = deepMerge(existingConfig, updates);
    if (!Value.Check(rseSchema, mergedConfig)) {
      const issues = [...Value.Errors(rseSchema, mergedConfig)].map(
        (err) => `Path "${err.path}": ${err.message}`,
      );
      relinka("error", "Invalid config after merge:", issues.join("; "));
      return false;
    }

    // Backup current config (if exists) and write merged config
    if (await fs.pathExists(configPath)) {
      await fs.copy(configPath, backupPath);
    }
    await writeRseConfig(configPath, mergedConfig, isDev);
    if (await fs.pathExists(backupPath)) {
      await fs.remove(backupPath);
    }
    relinka("success", "rse config updated successfully");
    return true;
  } catch (error) {
    relinka("error", "Failed to update config:", String(error));
    if (
      (await fs.pathExists(backupPath)) &&
      !(await fs.pathExists(configPath))
    ) {
      try {
        await fs.copy(backupPath, configPath);
        relinka("warn", "Restored config from backup after failed update");
      } catch (restoreError) {
        relinka(
          "error",
          "Failed to restore config from backup:",
          String(restoreError),
        );
      }
    }
    if (await fs.pathExists(tempPath)) {
      await fs.remove(tempPath);
    }
    return false;
  }
}

/**
 * Merges a partial config with the default config.
 */
export function mergeWithDefaults(partial: Partial<RseConfig>): RseConfig {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
    features: {
      ...DEFAULT_CONFIG.features,
      ...(partial.features ?? {}),
    },
    codeStyle: {
      ...DEFAULT_CONFIG.codeStyle,
      ...(partial.codeStyle ?? {}),
      modernize: {
        ...DEFAULT_CONFIG.codeStyle.modernize,
        ...(partial.codeStyle?.modernize ?? {}),
      },
    },
    preferredLibraries: {
      ...DEFAULT_CONFIG.preferredLibraries,
      ...(partial.preferredLibraries ?? {}),
    },
    monorepo: {
      ...DEFAULT_CONFIG.monorepo,
      ...(partial.monorepo ?? {}),
    },
    customRules: {
      ...DEFAULT_CONFIG.customRules,
      ...(partial.customRules ?? {}),
    },
    ignoreDependencies:
      partial.ignoreDependencies ?? DEFAULT_CONFIG.ignoreDependencies,
  };
}
