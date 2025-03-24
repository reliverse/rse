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
  type RequiredProjectContent,
} from "~/utils/getProjectContent.js";
import {
  getReliverseConfig,
  detectProjectsWithReliverse,
} from "~/utils/reliverseConfig.js";
import { findTsconfigUp } from "~/utils/tsconfigHelpers.js";

import type { ShowMenuResult } from "./types.js";

import { checkMissingDependencies } from "./deps.js";
import { getPromptContent } from "./prompts.js";
import {
  getTemplateUpdateInfo,
  updateProjectTemplateDate,
  type TemplateUpdateInfo,
} from "./templates.js";

/**
 * Defines what is returned when selecting or creating a project.
 */
export type ProjectSelectionResult = {
  projectPath: string;
  wasNewlyCreated: boolean;
};

/**
 * Constructs the menu options for selecting an existing project
 * or creating a new one. Includes an "Exit" option.
 */
function buildProjectSelectionMenuOptions(
  cwd: string,
  detectedProjects: { path: string }[],
  directoryEmpty: boolean,
) {
  const baseOptions = detectedProjects.map((proj) => ({
    label: `Edit: ${path.relative(cwd, proj.path)}`,
    value: proj.path,
    hint: re.dim(proj.path),
  }));

  baseOptions.push({
    label: "Create new project",
    value: "new-project",
    hint: re.dim("create a new project"),
  });

  baseOptions.push({
    label: "Exit",
    value: "exit",
    hint: re.dim("exits the manual builder"),
  });

  return {
    title: "Reliverse Project Selection",
    content: directoryEmpty
      ? `Dir ${cwd} is empty`
      : "Choose an existing project or create a new one.",
    options: baseOptions,
  };
}

/**
 * Shows a menu to pick an existing Reliverse project or create a new one.
 */
export async function handleProjectSelectionMenu(
  cwd: string,
  isDev: boolean,
): Promise<string> {
  const detectedProjects = await detectProjectsWithReliverse(cwd, isDev);
  const directoryEmpty = await isDirectoryEmpty(cwd);

  const menuData = buildProjectSelectionMenuOptions(
    cwd,
    detectedProjects,
    directoryEmpty,
  );

  const selectedOption = await selectPrompt(menuData);

  if (selectedOption === "exit") {
    process.exit(0);
  }

  if (selectedOption === "new-project") {
    const projectName = await askProjectName({});
    const projectPath = path.resolve(cwd, projectName);
    await createNewProject(projectPath, projectName, isDev);
    return projectPath;
  }

  return selectedOption;
}

/**
 * Creates a new project directory and initializes it with basic config files.
 * Also prompts the user for additional setup steps.
 */
export async function createNewProject(
  projectPath: string,
  projectName: string,
  isDev: boolean,
): Promise<void> {
  const projectType = await askAppOrLib(projectName);
  const isLib = projectType === "lib";
  const projectFramework: ProjectFramework = isLib ? "npm-jsr" : "unknown";

  await ensuredir(projectPath);

  await createPackageJSON(projectPath, projectName, isLib);
  await createTSConfig(projectPath, isLib, isDev);

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
 * Presents a menu for an existing project that already has the necessary files.
 * Allows the user to install dependencies, update project templates, or edit settings.
 */
export async function showExistingProjectMenu(
  cwd: string,
  isDev: boolean,
): Promise<{ areDependenciesMissing: boolean }> {
  const { requiredContent, optionalContent } = await getProjectContent(cwd);

  const { depsMissing } = await checkMissingDependencies(
    cwd,
    requiredContent,
    optionalContent,
  );

  const { updateAvailable, updateInfo } = await getTemplateUpdateInfo(
    cwd,
    isDev,
    requiredContent.fileReliverse,
  );

  const menuOptions = buildExistingProjectMenuOptions(
    depsMissing,
    updateAvailable,
    updateInfo,
  );

  const promptContent = getPromptContent(depsMissing, updateAvailable);

  const action = await selectPrompt({
    title: "Manual Builder Mode",
    content: promptContent,
    options: menuOptions,
  });

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

  return { areDependenciesMissing: depsMissing };
}

/**
 * Builds the selection menu for an existing project, reflecting whether
 * dependencies are missing or a template update is available.
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
        `Current: ${updateInfo.currentDate.slice(0, 10)}, Latest: ${updateInfo.latestDate?.slice(
          0,
          10,
        )}`,
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

/**
 * Determines the project status by checking whether the necessary
 * Reliverse and package.json files exist in this directory.
 */
export function determineProjectStatus(
  requiredContent: RequiredProjectContent,
): "new" | "existing" | "incomplete" {
  const isNewReliverseProject =
    !requiredContent.fileReliverse && requiredContent.filePackageJson;
  const isExistingProject = Object.values(requiredContent).every(Boolean);

  if (isNewReliverseProject) return "new";
  if (isExistingProject) return "existing";
  return "incomplete";
}

/**
 * Sets up new Reliverse configuration files for a project without them.
 */
export async function handleNewProject(
  cwd: string,
  isDev: boolean,
): Promise<ShowMenuResult> {
  relinka("info", "Setting up Reliverse config for this project...");
  await getReliverseConfig(cwd, isDev, {});
  relinka("success", "Reliverse config created. Please re-run the builder.");
  return { areDependenciesMissing: false };
}

/**
 * Calls the advanced menu handler for a project that already has necessary files.
 */
export async function handleExistingProject(
  cwd: string,
  isDev: boolean,
): Promise<ShowMenuResult> {
  return showExistingProjectMenu(cwd, isDev);
}

/**
 * Explains that the current directory lacks the files needed for Reliverse work.
 */
export function handleIncompleteProject(): ShowMenuResult {
  relinka("info", "Project doesn't meet requirements for manual builder menu.");
  relinka("info", "Ensure you have a package.json and reliverse config file.");
  return { areDependenciesMissing: true };
}
