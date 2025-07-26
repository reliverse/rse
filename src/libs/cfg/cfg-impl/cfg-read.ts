/* ------------------------------------------------------------------
 * Config Read/Write (TypeBox)
 * ------------------------------------------------------------------
 */

import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { Value } from "@sinclair/typebox/value";
import { parseJSONC } from "confbox";
import { createJiti } from "jiti";

import type { RseConfig } from "./cfg-types";
import type { IterableError } from "./cfg-types";

import { writeRseConfig } from "./cfg-create";
import { repairAndParseJSON } from "./cfg-repair";
import { rseSchema } from "./cfg-schema";
import { mergeWithDefaults } from "./cfg-update";
import { getBackupAndTempPaths } from "./cfg-utils";

// Create jiti instance for TypeScript config loading
const jiti = createJiti(import.meta.url);

/**
 * Parses the config file and validates it against the schema.
 * Returns both the parsed object and any errors (if present).
 */
async function parseRseConfig(configPath: string): Promise<{
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
      relinka("verbose", "Used tool: jsonrepair.");
    }

    // Filter out fields that are not part of the rse config schema
    const schemaProperties = Object.keys(rseSchema.properties);
    const filteredParsed = Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(([key]) =>
        schemaProperties.includes(key),
      ),
    );

    const isValid = Value.Check(rseSchema, filteredParsed);
    return isValid
      ? { parsed: filteredParsed, errors: null }
      : {
          parsed: filteredParsed,
          errors: Value.Errors(rseSchema, filteredParsed),
        };
  } catch {
    return null;
  }
}

/**
 * Helper for TS config reading.
 * Uses jiti for TypeScript module loading.
 */
export async function readRseTs(configPath: string): Promise<RseConfig | null> {
  try {
    const config: RseConfig = await jiti.import(configPath, { default: true });

    if (Value.Check(rseSchema, config)) {
      return config;
    }
    relinka("warn", "TS config does not match the schema.");
    return null;
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
export async function readRseConfig(
  configPath: string,
  isDev: boolean,
): Promise<RseConfig | null> {
  if (configPath.endsWith(".ts")) {
    return await readRseTs(configPath);
  }
  if (!(await fs.pathExists(configPath))) return null;
  const { backupPath } = getBackupAndTempPaths(configPath);
  const parseResult = await parseRseConfig(configPath);
  if (!parseResult) return null;
  if (!parseResult.errors) return parseResult.parsed as RseConfig;

  const errors = [...parseResult.errors].map(
    (err) => `Path "${err.path}": ${err.message}`,
  );
  relinka("verbose", "Detected invalid fields in config:", errors.join("; "));

  const merged = mergeWithDefaults(parseResult.parsed as Partial<RseConfig>);
  if (Value.Check(rseSchema, merged)) {
    await writeRseConfig(configPath, merged, isDev);
    relinka("info", "Merged missing or invalid fields into config");
    return merged;
  }
  if (await fs.pathExists(backupPath)) {
    const backupResult = await parseRseConfig(backupPath);
    if (backupResult && !backupResult.errors) {
      await fs.copy(backupPath, configPath);
      relinka("info", "Restored config from backup");
      return backupResult.parsed as RseConfig;
    }
    relinka("warn", "Backup also invalid. Returning null.");
    return null;
  }
  return null;
}
