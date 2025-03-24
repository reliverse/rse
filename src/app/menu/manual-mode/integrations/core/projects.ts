import { ensuredir } from "@reliverse/fs";
import { nextStepsPrompt, relinka, selectPrompt } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import path from "pathe";

import type { ProjectFramework } from "~/libs/cfg/constants/cfg-schema.js";

import { askAppOrLib } from "~/app/prompts/askAppOrLib.js";
import { askInstallDeps } from "~/app/prompts/askInstallDeps.js";
import { askOpenInIDE } from "~/app/prompts/askOpenInIDE.js";
import { askProjectName } from "~/app/prompts/askProjectName.js";
import { createPackageJSON } from "~/utils/createPackageJSON.js";
import { createTSConfig } from "~/utils/createTSConfig.js";
import { isDirectoryEmpty } from "~/utils/filesysHelpers.js";
import {
  getProjectContent,
  getReliverseConfig,
  detectProjectsWithReliverse,
} from "~/utils/reliverseConfig.js";
import { findTsconfigUp } from "~/utils/tsconfigHelpers.js";

import { checkMissingDependencies } from "./deps.js";
import { getPromptContent } from "./prompts.js";
import {
  getTemplateUpdateInfo,
  updateProjectTemplateDate,
  type TemplateUpdateInfo,
} from "./templates.js";

/**
 * Shows a single selection menu allowing the user to manage
 * an existing project or create a new one. Also handles empty directories.
 */
export async function handleProjectSelectionMenu(
  cwd: string,
  isDev: boolean,
): Promise<string> {
  // Detect all subprojects in this directory
  const detectedProjects = await detectProjectsWithReliverse(cwd, isDev);
  const directoryEmpty = await isDirectoryEmpty(cwd);

  // Basic menu with subprojects (if any), plus "Create new" and "Exit"
  const menuOptions: { label: string; value: string; hint?: string }[] =
    detectedProjects.map((proj) => ({
      label: `Edit: ${path.relative(cwd, proj.path)}`,
      value: proj.path,
      hint: re.dim(proj.path),
    }));

  // Provide option to create new project
  menuOptions.push({
    label: "Create new project",
    value: "new-project",
  });

  menuOptions.push({ label: "Exit", value: "exit" });

  const selectedOption = await selectPrompt({
    title: "Reliverse Project Selection",
    content: directoryEmpty
      ? `Dir ${cwd} is empty`
      : "Choose an existing project or create a new one.",
    options: menuOptions,
  });

  if (selectedOption === "exit") {
    process.exit(0);
  }

  if (selectedOption === "new-project") {
    const projectName = await askProjectName({});
    const projectPath = path.resolve(cwd, projectName);
    await createNewProject(projectPath, projectName, isDev);
    // After creating a project, we switch to that path
    return projectPath;
  }

  // If user selected an existing project path, return it as the new cwd
  return selectedOption;
}

/**
 * Creates a new project setup with package.json, tsconfig, and Reliverse config.
 * If in dev mode, attempts to locate a shared tsconfig in parent directories.
 */
export async function createNewProject(
  projectPath: string,
  projectName: string,
  isDev: boolean,
): Promise<void> {
  // Prompt if this project is a library or an app first
  const projectType = await askAppOrLib(projectName);
  const isLib = projectType === "lib";
  const projectFramework: ProjectFramework = isLib ? "npm-jsr" : "unknown";

  // Then create the project folder
  await ensuredir(projectPath);

  await createPackageJSON(projectPath, projectName, isLib);
  await createTSConfig(projectPath, isLib, isDev);

  // Attempt to inherit a tsconfig if dev mode
  let customTsconfigPath: string | undefined;
  if (isDev) {
    const foundTsconfig = await findTsconfigUp(path.resolve(projectPath));
    if (foundTsconfig) {
      relinka("info-verbose", `Found parent tsconfig: ${foundTsconfig}`);
      customTsconfigPath = foundTsconfig;
    } else {
      relinka("warn", "No parent-level tsconfig.json found in dev mode.");
    }
  }

  await getReliverseConfig(
    projectPath,
    isDev,
    { projectFramework },
    customTsconfigPath,
  );

  // Prompt next steps and offer to open in an IDE
  await nextStepsPrompt({
    title: `Created new project "${projectName}" with minimal Reliverse config.`,
    content: [
      "It's recommended to:",
      "1. Edit the generated config files as needed.",
      "2. Rerun the manual builder to apply changes.",
    ],
  });

  try {
    await askOpenInIDE({ projectPath, isDev });
  } catch (error) {
    relinka(
      "warn",
      `Could not open project in IDE: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Presents a menu for an existing project that meets all requirements,
 * allowing dependency installation, template updates, or settings edits.
 */
export async function showExistingProjectMenu(
  cwd: string,
  isDev: boolean,
): Promise<{ areDependenciesMissing: boolean }> {
  // Gather content information
  const { requiredContent, optionalContent } = await getProjectContent(cwd);

  // Prepare dependency info
  const { depsMissing } = await checkMissingDependencies(
    cwd,
    requiredContent,
    optionalContent,
  );

  // Check for template updates
  const { updateAvailable, updateInfo } = await getTemplateUpdateInfo(
    cwd,
    isDev,
    requiredContent.fileReliverse,
  );

  // Build menu options
  const menuOptions = buildExistingProjectMenuOptions(
    depsMissing,
    updateAvailable,
    updateInfo,
  );

  // Determine content for the prompt
  const promptContent = getPromptContent(depsMissing, updateAvailable);

  // Prompt user with the final menu
  const action = await selectPrompt({
    title: "Manual Builder Mode",
    content: promptContent,
    options: menuOptions,
  });

  // Handle the user's choice
  if (action === "install-deps") {
    await askInstallDeps(cwd);
  } else if (action === "update-template" && updateInfo?.latestDate) {
    await updateProjectTemplateDate(cwd, updateInfo.latestDate, isDev);
    relinka("info", "Template date updated. Pull changes if needed.");
  } else if (action === "edit-settings") {
    relinka(
      "info",
      "Feature not implemented yet. Please edit your reliverse config file manually.",
    );
  }

  // Return final condition on whether deps are missing
  return { areDependenciesMissing: depsMissing };
}

/**
 * Constructs the menu options for an existing project, based on missing deps or update info.
 */
function buildExistingProjectMenuOptions(
  depsMissing: boolean,
  updateAvailable: boolean,
  updateInfo: TemplateUpdateInfo | null,
) {
  const menuOptions = [];

  if (depsMissing) {
    menuOptions.push({
      label: "🔌 Install dependencies",
      value: "install-deps",
      hint: re.dim("runs npm/yarn/pnpm/bun install"),
    });
  }

  if (updateAvailable && updateInfo) {
    menuOptions.push({
      label: "🔃 Update project template",
      value: "update-template",
      hint: re.dim(
        `Current: ${updateInfo.currentDate.slice(
          0,
          10,
        )}, Latest: ${updateInfo.latestDate?.slice(0, 10)}`,
      ),
    });
  }

  menuOptions.push({
    label: "📝 Edit project settings",
    value: "edit-settings",
    hint: re.dim("on https://reliverse.org"),
    disabled: depsMissing,
  });

  menuOptions.push({
    label: "👈 Exit",
    value: "exit",
  });

  return menuOptions;
}
