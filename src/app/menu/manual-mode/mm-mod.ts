import { ensuredir } from "@reliverse/fs";
import { nextStepsPrompt, relinka, selectPrompt } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import fs from "fs-extra";
import path from "pathe";

import type { ParamsOmitReli } from "~/app/app-types.js";
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
  getReliverseConfigPath,
  readReliverseConfig,
  detectProjectsWithReliverse,
} from "~/utils/reliverseConfig.js";

import {
  checkForTemplateUpdate,
  updateProjectTemplateDate,
  type TemplateUpdateInfo,
} from "./template/updateProjectTemplate.js";

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

/**
 * Shows a single selection menu allowing the user to manage
 * an existing project or create a new one. Also handles empty directories.
 */
async function handleProjectSelectionMenu(
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
 * Searches upward from the given path for a tsconfig.json.
 * Returns the full path if found, otherwise undefined.
 */
async function findTsconfigUp(fromPath: string): Promise<string | undefined> {
  let currentDir = fromPath;
  const rootPath = path.parse(currentDir).root;

  while (true) {
    const candidate = path.join(currentDir, "tsconfig.json");
    if (await fs.pathExists(candidate)) return candidate;
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir || currentDir === rootPath) break;
    currentDir = parentDir;
  }
  return undefined;
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
      "To continue setting up your project:",
      "1. Edit the generated config files as needed.",
      "2. Run the manual builder again to make further changes.",
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
async function showExistingProjectMenu(
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
 * Checks if deps exist in package.json but node_modules is missing.
 * Returns an object with flags about missing deps and whether any exist at all.
 */
async function checkMissingDependencies(
  cwd: string,
  requiredContent: Record<string, boolean>,
  optionalContent: Record<string, boolean>,
): Promise<{ depsMissing: boolean; hasAnyDeps: boolean }> {
  // Convert possibly undefined values to boolean
  const hasFilePackageJson = !!requiredContent.filePackageJson;
  const hasNodeModules = !!optionalContent.dirNodeModules;

  // "missing deps" means we have a package.json but node_modules is absent
  const hasMissingDeps = !hasNodeModules && hasFilePackageJson;

  // Check if package.json actually has dependencies
  let hasAnyDeps = false;
  if (hasFilePackageJson) {
    try {
      const pkgJson = await fs.readJSON(path.join(cwd, "package.json"));
      const depCount =
        Object.keys(pkgJson.dependencies || {}).length +
        Object.keys(pkgJson.devDependencies || {}).length;
      hasAnyDeps = depCount > 0;
    } catch {
      // If reading fails, assume no deps
      hasAnyDeps = false;
    }
  }

  // If node_modules is missing and package.json has dependencies, mark as depsMissing
  const depsMissing = hasMissingDeps && hasAnyDeps;
  return { depsMissing, hasAnyDeps };
}

/**
 * Retrieves template update info (if any) based on reliverse config presence.
 */
async function getTemplateUpdateInfo(
  cwd: string,
  isDev: boolean,
  hasReliverseFile: boolean,
): Promise<{
  updateAvailable: boolean;
  updateInfo: TemplateUpdateInfo | null;
}> {
  let updateInfo: TemplateUpdateInfo | null = null;
  let updateAvailable = false;

  if (hasReliverseFile) {
    const { configPath } = await getReliverseConfigPath(cwd, isDev, false);
    const projectConfig = await readReliverseConfig(configPath, isDev);
    if (projectConfig) {
      updateInfo = await checkForTemplateUpdate(projectConfig);
      updateAvailable = updateInfo.hasUpdate;
    }
  }

  return { updateAvailable, updateInfo };
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
      label: "Install dependencies",
      value: "install-deps",
      hint: re.dim("runs npm/yarn/pnpm/bun install"),
    });
  }

  if (updateAvailable && updateInfo) {
    menuOptions.push({
      label: "Update project template",
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

/**
 * Returns the text content for the final prompt, depending on missing deps or updates.
 */
function getPromptContent(
  depsMissing: boolean,
  updateAvailable: boolean,
): string {
  if (depsMissing) {
    return re.yellow(
      `Dependencies are missing in your project. Would you like to install them?\n${re.bold(
        "🚨 Note: Certain addons will be disabled until the dependencies are installed.",
      )}`,
    );
  }
  return updateAvailable
    ? re.yellow("Select an action to perform\n(An update is available)")
    : "Select an action to perform";
}
