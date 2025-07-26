import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { parseJSONC } from "confbox";

import type { RseConfig } from "./cfg-types";

import { updateRseConfig } from "./cfg-update";

/**
 * Migrates an external rseg file into the current project config.
 * Only migrates fields that exist in the current schema.
 */
export async function migrateRseConfig(
  externalrseth: string,
  projectPath: string,
  isDev: boolean,
) {
  try {
    const content = await fs.readFile(externalrseth, "utf-8");
    const parsed = parseJSONC(content);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSONC format in external config file");
    }

    const tempConfig = parsed as Partial<RseConfig>;
    const migratedFields: string[] = [];
    const validConfig: Partial<Record<keyof RseConfig, unknown>> = {};

    const keysToMigrate: (keyof RseConfig)[] = [
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

    const success = await updateRseConfig(
      projectPath,
      validConfig as Partial<RseConfig>,
      isDev,
    );

    if (success) {
      relinka("success", "Successfully migrated config");
      relinka("verbose", "Migrated fields:", migratedFields.join(", "));
    }

    await fs.remove(externalrseth);
  } catch (error) {
    relinka("warn", "Failed to migrate external config:", String(error));
  }
}
