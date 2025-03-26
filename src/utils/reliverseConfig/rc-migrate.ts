import { relinka } from "@reliverse/prompts";
import { parseJSONC } from "confbox";
import fs from "fs-extra";

import type { ReliverseConfig } from "~/libs/cfg/cfg-main.js";

import { updateReliverseConfig } from "./rc-update.js";

/**
 * Migrates an external reliverse config file into the current project config.
 * Only migrates fields that exist in the current schema.
 */
export async function migrateReliverseConfig(
  externalReliverseFilePath: string,
  projectPath: string,
  isDev: boolean,
) {
  try {
    const content = await fs.readFile(externalReliverseFilePath, "utf-8");
    const parsed = parseJSONC(content);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSONC format in external config file");
    }

    const tempConfig = parsed as Partial<ReliverseConfig>;
    const migratedFields: string[] = [];
    const validConfig: Partial<Record<keyof ReliverseConfig, unknown>> = {};

    const keysToMigrate: (keyof ReliverseConfig)[] = [
      "projectDescription",
      "version",
      "projectLicense",
      "projectRepository",
      "projectCategory",
      "projectSubcategory",
      "projectFramework",
      "projectTemplate",
      "projectArchitecture",
      "deployBehavior",
      "depsBehavior",
      "gitBehavior",
      "i18nBehavior",
      "scriptsBehavior",
      "existingRepoBehavior",
      "repoPrivacy",
      "features",
      "preferredLibraries",
      "codeStyle",
      "monorepo",
      "ignoreDependencies",
      "customRules",
      "skipPromptsUseAutoBehavior",
      "relinterConfirm",
    ];

    for (const key of keysToMigrate) {
      if (tempConfig[key] !== undefined) {
        validConfig[key] = tempConfig[key];
        migratedFields.push(String(key));
      }
    }

    const success = await updateReliverseConfig(
      projectPath,
      validConfig as Partial<ReliverseConfig>,
      isDev,
    );

    if (success) {
      relinka("success", "Successfully migrated config");
      relinka("success-verbose", "Migrated fields:", migratedFields.join(", "));
    }

    await fs.remove(externalReliverseFilePath);
  } catch (error) {
    relinka("warn", "Failed to migrate external config:", String(error));
  }
}
