import { re } from "@reliverse/relico";

import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

export function displayConfig(config: Partial<ProjectConfig>) {
  const configDisplay: string[] = [];

  if (config.projectName) {
    configDisplay.push(`${re.blue("Project Name:")} ${config.projectName}`);
  }

  if (config.frontend !== undefined) {
    const frontend = Array.isArray(config.frontend)
      ? config.frontend
      : [config.frontend];
    const frontendText =
      frontend.length > 0 && frontend[0] !== undefined
        ? frontend.join(", ")
        : "none";
    configDisplay.push(`${re.blue("Frontend:")} ${frontendText}`);
  }

  if (config.backend !== undefined) {
    configDisplay.push(`${re.blue("Backend:")} ${String(config.backend)}`);
  }

  if (config.runtime !== undefined) {
    configDisplay.push(`${re.blue("Runtime:")} ${String(config.runtime)}`);
  }

  if (config.api !== undefined) {
    configDisplay.push(`${re.blue("API:")} ${String(config.api)}`);
  }

  if (config.database !== undefined) {
    configDisplay.push(`${re.blue("Database:")} ${String(config.database)}`);
  }

  if (config.orm !== undefined) {
    configDisplay.push(`${re.blue("ORM:")} ${String(config.orm)}`);
  }

  if (config.auth !== undefined) {
    const authText =
      typeof config.auth === "boolean"
        ? config.auth
          ? "Yes"
          : "No"
        : String(config.auth);
    configDisplay.push(`${re.blue("Authentication:")} ${authText}`);
  }

  if (config.addons !== undefined) {
    const addons = Array.isArray(config.addons)
      ? config.addons
      : [config.addons];
    const addonsText =
      addons.length > 0 && addons[0] !== undefined ? addons.join(", ") : "none";
    configDisplay.push(`${re.blue("Addons:")} ${addonsText}`);
  }

  if (config.examples !== undefined) {
    const examples = Array.isArray(config.examples)
      ? config.examples
      : [config.examples];
    const examplesText =
      examples.length > 0 && examples[0] !== undefined
        ? examples.join(", ")
        : "none";
    configDisplay.push(`${re.blue("Examples:")} ${examplesText}`);
  }

  if (config.git !== undefined) {
    const gitText =
      typeof config.git === "boolean"
        ? config.git
          ? "Yes"
          : "No"
        : String(config.git);
    configDisplay.push(`${re.blue("Git Init:")} ${gitText}`);
  }

  if (config.packageManager !== undefined) {
    configDisplay.push(
      `${re.blue("Package Manager:")} ${String(config.packageManager)}`,
    );
  }

  if (config.install !== undefined) {
    const installText =
      typeof config.install === "boolean"
        ? config.install
          ? "Yes"
          : "No"
        : String(config.install);
    configDisplay.push(`${re.blue("Install Dependencies:")} ${installText}`);
  }

  if (config.dbSetup !== undefined) {
    configDisplay.push(
      `${re.blue("Database Setup:")} ${String(config.dbSetup)}`,
    );
  }

  if (configDisplay.length === 0) {
    return re.yellow("No configuration selected.");
  }

  return configDisplay.join("\n");
}
