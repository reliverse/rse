/* ------------------------------------------------------------------
 * Update Project Config
 * ------------------------------------------------------------------
 */

import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { Value } from "@sinclair/typebox/value";
import { parseJSONC } from "confbox";

import type { RseConfig } from "./cfg-types";

import { writeRseConfig } from "./cfg-create";
import { DEFAULT_CONFIG_RSE } from "./cfg-default";
import { getRseConfigPath } from "./cfg-path";
import { rseSchema } from "./cfg-schema";
import { getBackupAndTempPaths } from "./cfg-utils";

/**
 * Deep merges two objects recursively while preserving nested structures.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };
  for (const key in source) {
    if (!Object.hasOwn(source, key)) continue;
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
 * Compares two objects and returns an array of paths where values differ
 */
function findObjectDifferences(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
  path = "",
): string[] {
  const differences: string[] = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (val1 === undefined || val2 === undefined) {
      differences.push(
        `${currentPath}: ${val1 === undefined ? "removed" : "added"}`,
      );
      continue;
    }

    if (
      typeof val1 === "object" &&
      val1 !== null &&
      typeof val2 === "object" &&
      val2 !== null
    ) {
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          differences.push(`${currentPath}: array values differ`);
        }
      } else {
        differences.push(
          ...findObjectDifferences(
            val1 as Record<string, unknown>,
            val2 as Record<string, unknown>,
            currentPath,
          ),
        );
      }
    } else if (val1 !== val2) {
      differences.push(
        `${currentPath}: ${JSON.stringify(val1)} → ${JSON.stringify(val2)}`,
      );
    }
  }

  return differences;
}

/**
 * Filters out memory-related fields that should not be in the rse config
 */
function filterMemoryFields<T extends Record<string, unknown>>(config: T): T {
  const { code, key, ...rest } = config;
  return rest as T;
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

    // Filter out memory fields before merging
    const filteredUpdates = filterMemoryFields(updates);
    const mergedConfig = deepMerge(existingConfig, filteredUpdates);
    if (!Value.Check(rseSchema, mergedConfig)) {
      const issues = [...Value.Errors(rseSchema, mergedConfig)].map(
        (err) => `Path "${err.path}": ${err.message}`,
      );
      relinka("error", "Invalid config after merge:", issues.join("; "));
      return false;
    }

    // Check if there are actual changes before updating
    const differences = findObjectDifferences(existingConfig, mergedConfig);
    if (differences.length === 0) {
      relinka("verbose", "No changes detected in config, skipping update");
      return true;
    }

    // Log the changes
    relinka("info", "Config changes detected:");
    for (const diff of differences) {
      relinka("info", `  ${diff}`);
    }

    // Backup current config (if exists) and write merged config
    if (await fs.pathExists(configPath)) {
      await fs.copy(configPath, backupPath);
    }
    await writeRseConfig(configPath, mergedConfig, isDev);
    if (await fs.pathExists(backupPath)) {
      await fs.remove(backupPath);
    }
    relinka("null", "");
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
    ...DEFAULT_CONFIG_RSE,
    ...partial,
    features: {
      ...DEFAULT_CONFIG_RSE.features,
      ...(partial.features ?? {}),
    },
    codeStyle: {
      ...(DEFAULT_CONFIG_RSE.codeStyle ?? {}),
      ...(partial.codeStyle ?? {}),
      modernize: {
        ...(DEFAULT_CONFIG_RSE.codeStyle?.modernize ?? {}),
        ...(partial.codeStyle?.modernize ?? {}),
      },
    },
    preferredLibraries: {
      ...DEFAULT_CONFIG_RSE.preferredLibraries,
      ...(partial.preferredLibraries ?? {}),
    },
    monorepo: {
      ...DEFAULT_CONFIG_RSE.monorepo,
      ...(partial.monorepo ?? {}),
    },
    customRules: {
      ...DEFAULT_CONFIG_RSE.customRules,
      ...(partial.customRules ?? {}),
    },
    ignoreDependencies:
      partial.ignoreDependencies ?? DEFAULT_CONFIG_RSE.ignoreDependencies,
  };
}
