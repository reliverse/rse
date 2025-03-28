import type { ShowMenuResult } from "~/libs/sdk/add/add-local/core/types.js";
import type { ParamsOmitReli } from "~/libs/sdk/types/types-mod.js";

import { getProjectContent } from "~/libs/sdk/utils/getProjectContent.js";
import { setupDevModeIfNeeded } from "~/libs/sdk/utils/testsRuntime.js";

import {
  determineProjectStatus,
  handleExistingProject,
  handleIncompleteProject,
  handleNewProject,
  handleProjectSelectionMenu,
} from "./init-utils.js";

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
