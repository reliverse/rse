/* ------------------------------------------------------------------
 * Config Fixing Utilities
 * ------------------------------------------------------------------
 */

import type { TSchema } from "@sinclair/typebox";

import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { parseJSONC } from "confbox";
import { jsonrepair } from "jsonrepair";

import type { RseConfig } from "./cfg-types";

import { writeRseConfig } from "./cfg-create";
import { DEFAULT_CONFIG_RSE } from "./cfg-default";
import { rseSchema } from "./cfg-schema";
import { cleanGitHubUrl } from "./cfg-utils";

// Uses jsonrepair to fix broken JSON then parses it.
export function repairAndParseJSON(raw: string): any {
  try {
    const repaired = jsonrepair(raw);
    return JSON.parse(repaired);
  } catch (_error) {
    return null;
  }
}

/**
 * Creates a schema for a single property so that it can be validated in isolation.
 */
function createSinglePropertySchema(key: string, subSchema: TSchema): TSchema {
  return Type.Object({ [key]: subSchema } as Record<string, TSchema>, {
    additionalProperties: false,
    required: [key],
  });
}

/**
 * Validates a single property against its schema.
 */
function fixSingleProperty(
  schema: TSchema,
  propName: string,
  userValue: unknown,
  defaultValue: unknown,
): unknown {
  const singlePropertySchema = createSinglePropertySchema(propName, schema);
  const testObject = { [propName]: userValue };
  return Value.Check(singlePropertySchema, testObject)
    ? userValue
    : defaultValue;
}

/**
 * Recursively fixes each property in the object. Returns the fixed config and
 * an array of property paths that were changed.
 */
export function fixLineByLine(
  userConfig: unknown,
  defaultConfig: unknown,
  schema: TSchema,
): { fixedConfig: unknown; changedKeys: string[] } {
  const isObjectSchema =
    (schema as any).type === "object" && (schema as any).properties;

  if (
    !isObjectSchema ||
    typeof userConfig !== "object" ||
    userConfig === null
  ) {
    const isValid = Value.Check(schema, userConfig);
    return {
      fixedConfig: isValid ? userConfig : defaultConfig,
      changedKeys: isValid ? [] : ["<entire_object>"],
    };
  }

  const properties = (schema as any).properties as Record<string, TSchema>;
  const result: Record<string, unknown> = { ...((defaultConfig as any) ?? {}) };
  const changedKeys: string[] = [];
  const missingKeys: string[] = [];

  for (const propName of Object.keys(properties)) {
    const subSchema = properties[propName];
    const userValue = (userConfig as any)[propName];
    const defaultValue = (defaultConfig as any)[propName];

    if (!subSchema) {
      result[propName] = defaultValue;
      changedKeys.push(propName);
      continue;
    }

    if (userValue === undefined && !(propName in userConfig)) {
      missingKeys.push(propName);
      result[propName] = defaultValue;
      continue;
    }

    // Special handling for GitHub URL arrays
    if (
      propName === "customUserFocusedRepos" ||
      propName === "customDevsFocusedRepos"
    ) {
      if (Array.isArray(userValue)) {
        result[propName] = userValue.map((url) => cleanGitHubUrl(String(url)));
        continue;
      }
    }

    const isValidStructure = Value.Check(
      createSinglePropertySchema(propName, subSchema),
      {
        [propName]: userValue,
      },
    );
    if (!isValidStructure) {
      result[propName] = defaultValue;
      changedKeys.push(propName);
    } else if (
      subSchema &&
      typeof subSchema === "object" &&
      "type" in subSchema &&
      subSchema.type === "object"
    ) {
      const { fixedConfig, changedKeys: nestedChanges } = fixLineByLine(
        userValue,
        defaultValue,
        subSchema,
      );
      result[propName] = fixedConfig;
      if (nestedChanges.length > 0) {
        changedKeys.push(...nestedChanges.map((nc) => `${propName}.${nc}`));
      }
    } else {
      const originalValue = userValue;
      const validatedValue = fixSingleProperty(
        subSchema,
        propName,
        userValue,
        defaultValue,
      );
      result[propName] = validatedValue;
      if (originalValue !== undefined && validatedValue !== originalValue) {
        changedKeys.push(propName);
      }
    }
  }

  if (missingKeys.length > 0) {
    relinka(
      "verbose",
      "Missing fields injected from default config:",
      missingKeys.join(", "),
    );
  }

  return { fixedConfig: result, changedKeys };
}

/**
 * Reads the config file, fixes invalid lines based on the schema,
 * writes back the fixed config, and returns the fixed config.
 */
export async function parseAndFixRseConfig(
  configPath: string,
  isDev: boolean,
): Promise<RseConfig | null> {
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    let parsed = parseJSONC(raw);
    if (!parsed || typeof parsed !== "object") {
      const repaired = repairAndParseJSON(raw);
      if (repaired) {
        relinka("info", "Config JSON was repaired.");
        relinka("verbose", "Used tool: jsonrepair.");
      }
      parsed = repaired;
    }
    if (parsed && typeof parsed === "object") {
      const originalErrors = [...Value.Errors(rseSchema, parsed)];
      if (originalErrors.length === 0) return parsed as RseConfig;

      const { fixedConfig, changedKeys } = fixLineByLine(
        parsed,
        DEFAULT_CONFIG_RSE,
        rseSchema,
      );
      if (Value.Check(rseSchema, fixedConfig)) {
        await writeRseConfig(configPath, fixedConfig, isDev);
        const originalInvalidPaths = originalErrors.map((err) => err.path);
        relinka(
          "info",
          "Your config has been fixed. Please ensure it aligns with your project.",
          `Changed keys: ${changedKeys.join(", ") || "(none)"}`,
        );
        relinka(
          "verbose",
          `Originally invalid paths were: ${originalInvalidPaths.join(", ") || "(none)"}`,
        );
        return fixedConfig;
      }
      const newErrs = [...Value.Errors(rseSchema, fixedConfig)].map(
        (e) => `Path "${e.path}": ${e.message}`,
      );
      relinka(
        "warn",
        "Could not fix all invalid config lines:",
        newErrs.join("; "),
      );
      return null;
    }
  } catch (error) {
    relinka(
      "warn",
      "Failed to parse/fix config line-by-line:",
      error instanceof Error ? error.message : String(error),
    );
  }
  return null;
}
