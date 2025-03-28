import { ensuredir } from "@reliverse/fs";
import { nextStepsPrompt, relinka, selectPrompt } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import path from "pathe";
import { simpleGit, type SimpleGit } from "simple-git";

import type { ProjectFramework } from "~/libs/cfg/constants/cfg-types.js";
import type { ShowMenuResult } from "~/libs/sdk/add/add-local/core/types.js";

import { checkMissingDependencies } from "~/libs/sdk/add/add-local/core/deps.js";
import { getPromptContent } from "~/libs/sdk/add/add-local/core/prompts.js";
import {
  getTemplateUpdateInfo,
  updateProjectTemplateDate,
  type TemplateUpdateInfo,
} from "~/libs/sdk/add/add-local/core/templates.js";
import { createPackageJSON } from "~/libs/sdk/utils/createPackageJSON.js";
import { createTSConfig } from "~/libs/sdk/utils/createTSConfig.js";
import { isDirectoryEmpty } from "~/libs/sdk/utils/filesysHelpers.js";
import {
  getProjectContent,
  type RequiredProjectContent,
} from "~/libs/sdk/utils/getProjectContent.js";
import { askAppOrLib } from "~/libs/sdk/utils/prompts/askAppOrLib.js";
import { askInstallDeps } from "~/libs/sdk/utils/prompts/askInstallDeps.js";
import { askOpenInIDE } from "~/libs/sdk/utils/prompts/askOpenInIDE.js";
import { askProjectName } from "~/libs/sdk/utils/prompts/askProjectName.js";
import { shouldInitGit } from "~/libs/sdk/utils/prompts/shouldInitGit.js";
import { detectProjectsWithReliverse } from "~/libs/sdk/utils/reliverseConfig/rc-detect.js";
import { getReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { findTsconfigUp } from "~/libs/sdk/utils/tsconfigHelpers.js";

import { promptGitDeploy } from "./use-template/cp-modules/git-deploy-prompts/gdp-mod.js";
import { initializeGitRepo } from "./use-template/cp-modules/git-deploy-prompts/git.js";

/** Constants for menu option values */
const NEW_PROJECT_OPTION = "new-project";
const EXIT_OPTION = "exit";

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
  // Build menu options for each detected project
  const baseOptions = detectedProjects.map((detectedProject) => ({
    label: `Edit: ${path.relative(cwd, detectedProject.path)}`,
    value: detectedProject.path,
    hint: re.dim(detectedProject.path),
  }));

  baseOptions.push({
    label: "Create new project",
    value: NEW_PROJECT_OPTION,
    hint: re.dim("create a new project"),
  });
  baseOptions.push({
    label: "Exit",
    value: EXIT_OPTION,
    hint: re.dim("exits the manual builder"),
  });

  return {
    title: "Reliverse Project Selection",
    content: directoryEmpty
      ? `Directory ${cwd} is empty`
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
  try {
    const detectedProjects = await detectProjectsWithReliverse(cwd, isDev);
    const directoryEmpty = await isDirectoryEmpty(cwd);

    const menuData = buildProjectSelectionMenuOptions(
      cwd,
      detectedProjects,
      directoryEmpty,
    );

    const selectedOption = await selectPrompt(menuData);

    if (selectedOption === EXIT_OPTION) {
      process.exit(0);
    }

    if (selectedOption === NEW_PROJECT_OPTION) {
      const projectName = await askProjectName({});
      const projectPath = path.resolve(cwd, projectName);
      await initMinimalReliverseProject(projectPath, projectName, isDev);
      return projectPath;
    }

    // Return the selected project path
    return selectedOption;
  } catch (error) {
    relinka(
      "error",
      `An error occurred during project selection: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exit(1);
  }
}

/**
 * Creates a new project directory and initializes it with basic config files.
 * Also prompts the user for additional setup steps.
 */
export async function initMinimalReliverseProject(
  projectPath: string,
  projectName: string,
  isDev: boolean,
): Promise<void> {
  try {
    // Determine project type and framework
    const projectType = await askAppOrLib(projectName);
    const isLib = projectType === "lib";
    const projectFramework: ProjectFramework = isLib ? "npm-jsr" : "unknown";

    // Ensure the project directory exists
    await ensuredir(projectPath);

    // Create the package.json and TypeScript configuration
    await createPackageJSON(projectPath, projectName, isLib);
    await createTSConfig(projectPath, isLib, isDev);

    let customTsconfigPath: string | undefined;
    // In development mode, try to locate a parent tsconfig
    if (isDev) {
      const foundTsconfig = await findTsconfigUp(path.resolve(projectPath));
      if (foundTsconfig) {
        relinka("info-verbose", `Found parent tsconfig: ${foundTsconfig}`);
        customTsconfigPath = foundTsconfig;
      } else {
        relinka("warn", "No parent-level tsconfig.json found in dev mode.");
      }
    }

    // Load or create Reliverse configuration for the project
    const { config } = await getReliverseConfig(
      projectPath,
      isDev,
      { projectFramework },
      customTsconfigPath,
    );

    // In dev mode, optionally initialize Git
    if (isDev) {
      const shouldInit = await shouldInitGit(isDev);
      if (shouldInit) {
        const git: SimpleGit = simpleGit({ baseDir: projectPath });
        await initializeGitRepo(git, false, config, false);
      }
    } else {
      // In non-dev mode, prompt for Git deployment options
      const memory = await getReliverseMemory();
      await promptGitDeploy({
        isLib: false,
        projectName,
        config,
        projectPath,
        primaryDomain: "",
        hasDbPush: false,
        shouldRunDbPush: false,
        shouldInstallDeps: false,
        isDev,
        memory,
        cwd: projectPath,
        maskInput: false,
        skipPrompts: false,
        selectedTemplate: "unknown",
        isTemplateDownload: false,
        frontendUsername: "",
      });
    }

    // Prompt the user with next steps after project creation
    await nextStepsPrompt({
      title: `Created new project "${projectName}" with minimal Reliverse config.`,
      content: [
        "It's recommended to:",
        "1. Edit the generated config files as needed.",
        "2. Rerun the manual builder to apply changes.",
        "p.s. Fast way to open manual builder:",
        isDev
          ? "`bun dev:init` or `bun dev:add` (the same thing)"
          : "`reliverse init` or `reliverse add` (the same thing)",
      ],
    });

    // Attempt to open the project in the user's IDE
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
  } catch (error) {
    relinka(
      "error",
      `Failed to initialize project: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exit(1);
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
  try {
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
  } catch (error) {
    relinka(
      "error",
      `Error handling existing project: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exit(1);
  }
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
    value: EXIT_OPTION,
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
  const hasReliverse = Boolean(requiredContent.fileReliverse);
  const hasPackageJson = Boolean(requiredContent.filePackageJson);
  const isExistingProject = Object.values(requiredContent).every(Boolean);

  if (!hasReliverse && hasPackageJson) return "new";
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
  try {
    relinka("info", "Setting up Reliverse config for this project...");
    await getReliverseConfig(cwd, isDev, {});
    relinka("success", "Reliverse config created. Please re-run the builder.");
    return { areDependenciesMissing: false };
  } catch (error) {
    relinka(
      "error",
      `Failed to setup new project configuration: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exit(1);
  }
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
