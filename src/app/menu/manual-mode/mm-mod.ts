import { ensuredir } from "@reliverse/fs";
import { relinka } from "@reliverse/prompts";
import path from "pathe";

import type { ParamsOmitReli } from "~/app/app-types.js";

import {
  getProjectContent,
  getReliverseConfig,
} from "~/utils/reliverseConfig.js";

import {
  handleProjectSelectionMenu,
  showExistingProjectMenu,
} from "./integrations/core/projects.js";

/**
 * Main entry point for the manual builder menu.
 * Starts in dev mode if flagged, then lets the user pick or create a project.
 */
export async function showManualBuilderMenu(params: ParamsOmitReli) {
  let { cwd } = params;
  const { isDev } = params;

  // Switch to a dedicated runtime directory if running in dev mode
  if (isDev) {
    cwd = path.join(cwd, "tests-runtime");
    await ensuredir(cwd);
    params.cwd = cwd;
    relinka("info-verbose", `Dev mode: using tests-runtime => ${cwd}`);
  }

  try {
    // Single unified menu to choose or create a project
    cwd = await handleProjectSelectionMenu(cwd, isDev);
    params.cwd = cwd;

    // Check the current directory's project content to see if it’s new or existing
    const { requiredContent } = await getProjectContent(cwd);
    const isNewReliverseProject =
      !requiredContent.fileReliverse && requiredContent.filePackageJson;
    const isExistingProject = Object.values(requiredContent).every(Boolean);

    // If there's a package.json but no reliverse config, create config
    if (isNewReliverseProject) {
      relinka("info", "Setting up Reliverse config for this project...");
      await getReliverseConfig(cwd, isDev, {});
      relinka(
        "success",
        "Reliverse config created. Please re-run the builder.",
      );
      return { areDependenciesMissing: false };
    }

    // If it has both package.json and reliverse config, proceed to advanced menu
    if (isExistingProject) {
      return await showExistingProjectMenu(cwd, isDev);
    }

    // Otherwise, user needs to ensure the project has the required files
    relinka(
      "info",
      "Project doesn't meet requirements for manual builder menu.",
    );
    relinka(
      "info",
      "Ensure you have a package.json and reliverse config file.",
    );
    return { areDependenciesMissing: true };
  } catch (error) {
    console.error(
      "Error showing manual builder menu:",
      error instanceof Error ? error.message : String(error),
    );
    return { areDependenciesMissing: true };
  }
}
