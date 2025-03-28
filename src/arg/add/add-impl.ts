import type { ParamsOmitReli } from "~/app/app-types.js";

import { getProjectContent } from "~/utils/getProjectContent.js";
import { setupDevModeIfNeeded } from "~/utils/testsRuntime.js";

import type { ShowMenuResult } from "./add-local/core/types.js";

import {
  determineProjectStatus,
  handleExistingProject,
  handleIncompleteProject,
  handleNewProject,
  handleProjectSelectionMenu,
} from "./add-local/core/projects.js";

/**
 * Main entry point for the manual builder menu.
 */
export async function showManualBuilderMenu(
  params: ParamsOmitReli,
): Promise<ShowMenuResult> {
  await setupDevModeIfNeeded(params);

  try {
    const cwd = await handleProjectSelectionMenu(params.cwd, params.isDev);
    params.cwd = cwd;

    const { requiredContent } = await getProjectContent(cwd);
    const projectStatus = determineProjectStatus(requiredContent);

    if (projectStatus === "new") {
      return await handleNewProject(cwd, params.isDev);
    }
    if (projectStatus === "existing") {
      return await handleExistingProject(cwd, params.isDev);
    }
    return handleIncompleteProject();
  } catch (error) {
    console.error(
      "Error showing manual builder menu:",
      error instanceof Error ? error.message : String(error),
    );
    return { areDependenciesMissing: true };
  }
}
