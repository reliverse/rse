/* ------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------
 */

import { relinka } from "@reliverse/prompts";
import { tsconfigJson } from "@reliverse/relidler-sdk";
import fs from "fs-extra";
import path from "pathe";
import { readTSConfig, writeTSConfig } from "pkg-types";

import {
  cliConfigTs,
  cliConfigTsBak,
  cliConfigTsTmp,
  cliConfigJsoncBak,
  cliConfigJsoncTmp,
} from "~/libs/cfg/cfg-main.js";

/**
 * Cleans GitHub repository URLs by removing git+ prefix and .git suffix.
 */
export function cleanGitHubUrl(url: string): string {
  return url
    .trim()
    .replace(/^git\+/, "")
    .replace(
      /^https?:\/\/(www\.)?(github|gitlab|bitbucket|sourcehut)\.com\//i,
      "",
    )
    .replace(/^(github|gitlab|bitbucket|sourcehut)\.com\//i, "")
    .replace(/\.git$/i, "");
}

// Checks if a key is a valid JavaScript identifier.
function isValidIdentifier(key: string): boolean {
  // Precompiled regex for performance.
  const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;
  return identifierRegex.test(key);
}

// Recursively converts an object to a code string for an object literal.
export function objectToCodeString(obj: any, indentLevel = 0): string {
  const indent = "  ".repeat(indentLevel);
  const indentNext = "  ".repeat(indentLevel + 1);

  if (obj === null) return "null";
  if (typeof obj === "string") return JSON.stringify(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj.map((item) => objectToCodeString(item, indentLevel + 1));
    return `[\n${items.map((item) => `${indentNext}${item}`).join(",\n")}\n${indent}]`;
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    const lines = keys.map((key) => {
      const formattedKey = isValidIdentifier(key) ? key : JSON.stringify(key);
      const valueStr = objectToCodeString(obj[key], indentLevel + 1);
      return `${indentNext}${formattedKey}: ${valueStr}`;
    });
    return `{\n${lines.join(",\n")}\n${indent}}`;
  }
  return String(obj);
}

// Updates tsconfig.json's "include" array to ensure "reliverse.ts" is present.
export async function updateTsConfigInclude(
  projectPath: string,
): Promise<void> {
  const tsconfigPath = path.join(projectPath, tsconfigJson);
  if (!(await fs.pathExists(tsconfigPath))) return;
  try {
    const tsconfig = await readTSConfig(projectPath);
    tsconfig.include = Array.isArray(tsconfig.include) ? tsconfig.include : [];
    if (!tsconfig.include.includes(cliConfigTs)) {
      tsconfig.include.push(cliConfigTs);
      await writeTSConfig(tsconfigPath, tsconfig);
      relinka(
        "success-verbose",
        "Updated tsconfig.json to include reliverse.ts",
      );
    }
  } catch (err) {
    relinka(
      "warn",
      "Failed to update tsconfig.json:",
      err instanceof Error ? err.message : String(err),
    );
  }
}

/**
 * Returns the backup and temporary file paths for a given config file.
 */
export function getBackupAndTempPaths(configPath: string): {
  backupPath: string;
  tempPath: string;
} {
  const configDir = path.dirname(configPath);
  if (configPath.endsWith(".ts")) {
    return {
      backupPath: path.join(configDir, cliConfigTsBak),
      tempPath: path.join(configDir, cliConfigTsTmp),
    };
  }
  return {
    backupPath: path.join(configDir, cliConfigJsoncBak),
    tempPath: path.join(configDir, cliConfigJsoncTmp),
  };
}

/**
 * Helper to atomically write a file with backup and temporary file handling.
 */
export async function atomicWriteFile(
  filePath: string,
  content: string,
  backupPath: string,
  tempPath: string,
): Promise<void> {
  if (await fs.pathExists(filePath)) {
    await fs.copy(filePath, backupPath);
  }
  await fs.writeFile(tempPath, content, "utf-8");
  await fs.rename(tempPath, filePath);
  if (await fs.pathExists(backupPath)) {
    await fs.remove(backupPath);
  }
}
