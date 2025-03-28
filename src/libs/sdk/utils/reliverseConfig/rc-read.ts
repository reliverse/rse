/* ------------------------------------------------------------------
 * Config Read/Write (TypeBox)
 * ------------------------------------------------------------------
 */

import { relinka } from "@reliverse/prompts";
import { Value } from "@sinclair/typebox/value";
import { parseJSONC } from "confbox";
import fs from "fs-extra";
import { pathToFileURL } from "url";

import {
  reliverseConfigSchema,
  type ReliverseConfig,
} from "~/libs/cfg/cfg-main.js";

import type { IterableError } from "./rc-types.js";

import { writeReliverseConfig } from "./rc-create.js";
import { repairAndParseJSON } from "./rc-repair.js";
import { mergeWithDefaults } from "./rc-update.js";
import { getBackupAndTempPaths } from "./rc-utils.js";

/**
 * Parses the config file and validates it against the schema.
 * Returns both the parsed object and any errors (if present).
 */
async function parseReliverseFile(configPath: string): Promise<{
  parsed: unknown;
  errors: IterableError | null;
} | null> {
  try {
    const content = (await fs.readFile(configPath, "utf-8")).trim();
    if (!content || content === "{}") return null;
    let parsed = parseJSONC(content);
    if (!parsed || typeof parsed !== "object") {
      const repaired = repairAndParseJSON(content);
      if (!repaired) return null;
      parsed = repaired;
      relinka("info", "Config JSON was repaired.");
      relinka("info-verbose", "Used tool: jsonrepair.");
    }
    const isValid = Value.Check(reliverseConfigSchema, parsed);
    return isValid
      ? { parsed, errors: null }
      : { parsed, errors: Value.Errors(reliverseConfigSchema, parsed) };
  } catch {
    return null;
  }
}

/**
 * Helper for TS config reading.
 * Uses a query parameter to bust the module cache.
 */
export async function readReliverseConfigTs(
  configPath: string,
): Promise<ReliverseConfig | null> {
  try {
    const moduleUrl = `${pathToFileURL(configPath).href}?update=${Date.now()}`;
    const configModule = await import(moduleUrl);
    const config = configModule.default;

    if (Value.Check(reliverseConfigSchema, config)) {
      return config;
    } else {
      relinka("warn", "TS config does not match the schema.");
      return null;
    }
  } catch (error) {
    relinka(
      "error",
      "Failed to import TS config:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

/**
 * Reads and validates the config file.
 * If errors are detected, it attempts to merge missing or invalid fields with defaults.
 */
export async function readReliverseConfig(
  configPath: string,
  isDev: boolean,
): Promise<ReliverseConfig | null> {
  if (configPath.endsWith(".ts")) {
    return await readReliverseConfigTs(configPath);
  }
  if (!(await fs.pathExists(configPath))) return null;
  const { backupPath } = getBackupAndTempPaths(configPath);
  const parseResult = await parseReliverseFile(configPath);
  if (!parseResult) return null;
  if (!parseResult.errors) return parseResult.parsed as ReliverseConfig;

  const errors = [...parseResult.errors].map(
    (err) => `Path "${err.path}": ${err.message}`,
  );
  relinka(
    "warn-verbose",
    "Detected invalid fields in config:",
    errors.join("; "),
  );

  const merged = mergeWithDefaults(
    parseResult.parsed as Partial<ReliverseConfig>,
  );
  if (Value.Check(reliverseConfigSchema, merged)) {
    await writeReliverseConfig(configPath, merged, isDev);
    relinka("info", "Merged missing or invalid fields into config");
    return merged;
  } else {
    if (await fs.pathExists(backupPath)) {
      const backupResult = await parseReliverseFile(backupPath);
      if (backupResult && !backupResult.errors) {
        await fs.copy(backupPath, configPath);
        relinka("info", "Restored config from backup");
        return backupResult.parsed as ReliverseConfig;
      }
      relinka("warn", "Backup also invalid. Returning null.");
      return null;
    }
    return null;
  }
}
