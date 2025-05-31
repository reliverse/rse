import path from "@reliverse/pathkit";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import {
  confirmPrompt,
  selectPrompt,
  multiselectPrompt,
  nextStepsPrompt,
  inputPrompt,
} from "@reliverse/rempts";
import { normalizeName } from "@reliverse/rempts";
import { installDependencies } from "nypm";
import open from "open";
import os from "os";

import type { ProjectConfigReturn, RseConfig } from "~/libs/sdk/sdk-types";
import type { Behavior } from "~/libs/sdk/sdk-types";
import type { RepoOption } from "~/libs/sdk/utils/projectRepository";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

import { cliDomainDocs, homeDir, UNKNOWN_VALUE } from "~/libs/sdk/constants";
import { experimental } from "~/libs/sdk/utils/badgeNotifiers";
import { setupI18nFiles } from "~/libs/sdk/utils/downloading/downloadI18nFiles";
import { isVSCodeInstalled } from "~/libs/sdk/utils/handlers/isAppInstalled";
import { promptPackageJsonScripts } from "~/libs/sdk/utils/handlers/promptPackageJsonScripts";
import { askOpenInIDE } from "~/libs/sdk/utils/prompts/askOpenInIDE";
import { askProjectName } from "~/libs/sdk/utils/prompts/askProjectName";
import { askUsernameFrontend } from "~/libs/sdk/utils/prompts/askUsernameFrontend";

/**
 * Ensures a unique project name by prompting for a new one if the target directory exists.
 */
async function ensureUniqueProjectName(
  initialName: string,
  isDev: boolean,
  cwd: string,
  skipPrompts: boolean,
): Promise<string> {
  let projectName = initialName;
  let targetPath = isDev
    ? path.join(cwd, "tests-runtime", projectName)
    : path.join(cwd, projectName);

  let index = 1;
  while (await fs.pathExists(targetPath)) {
    if (skipPrompts) {
      // In auto mode, append an incrementing index to make it unique
      projectName = `${initialName}-${index}`;
      index++;
    } else {
      // Prompt for a new name
      projectName = await inputPrompt({
        title: `Project directory '${projectName}' already exists. Please choose a different name:`,
        defaultValue: `${projectName}-${index}`,
        validate: (value) => {
          if (!value) return "Project name cannot be empty";
          if (!/^[a-z0-9-_]+$/i.test(value)) {
            return "Project name can only contain letters, numbers, hyphens, and underscores";
          }
          return true;
        },
      });
    }
    targetPath = isDev
      ? path.join(cwd, "tests-runtime", projectName)
      : path.join(cwd, projectName);
  }

  return projectName;
}

/**
 * Asks or auto-fills project details (username, projectName, domain).
 */
export async function initializeProjectConfig(
  projectName: string,
  _memory: ReliverseMemory,
  config: RseConfig,
  skipPrompts: boolean,
  isDev: boolean,
  cwd: string,
): Promise<ProjectConfigReturn> {
  // 1. Determine user (author)
  const frontendUsername =
    skipPrompts &&
    config?.projectAuthor !== UNKNOWN_VALUE &&
    config?.projectAuthor !== ""
      ? config.projectAuthor
      : ((await askUsernameFrontend(config, true)) ?? "default-user");

  if (!frontendUsername || frontendUsername.trim() === "") {
    throw new Error(
      "Failed to determine your frontend username. Please try again or notify the CLI developers.",
    );
  }

  // 2. Determine project name
  if (skipPrompts) {
    if (projectName !== UNKNOWN_VALUE) {
      projectName = normalizeName(projectName);
    } else {
      projectName = (await askProjectName({ repoName: "" })) ?? "my-app";
    }
  } else {
    projectName = (await askProjectName({ repoName: "" })) ?? "my-app";
  }

  // Ensure the project name is unique
  projectName = await ensureUniqueProjectName(
    projectName,
    isDev,
    cwd,
    skipPrompts,
  );

  // 3. Determine domain
  const primaryDomain =
    skipPrompts &&
    config?.projectDomain !== UNKNOWN_VALUE &&
    config?.projectDomain !== ""
      ? config.projectDomain
      : `${projectName}.vercel.app`;

  return {
    frontendUsername: frontendUsername.trim(),
    projectName,
    primaryDomain: primaryDomain ?? `${projectName}.vercel.app`,
  };
}

/**
 * Sets up i18n if needed and not already present.
 * Uses config.i18nBehavior to determine automatic behavior.
 */
export async function setupI18nSupport(
  projectPath: string,
  config: RseConfig,
): Promise<boolean> {
  // Check if i18n folder already exists
  const i18nFolderExists =
    (await fs.pathExists(path.join(projectPath, "src/app/[locale]"))) ||
    (await fs.pathExists(path.join(projectPath, "src/app/[lang]")));

  if (i18nFolderExists) {
    relinka(
      "verbose",
      "i18n is already enabled in the template. No changes needed.",
    );
    return true;
  }

  // Determine if i18n should be enabled based on behavior setting
  const i18nBehavior = config.i18nBehavior;
  let shouldEnableI18n = false;

  if (i18nBehavior !== "prompt") {
    // Use automatic behavior if skipping prompts or behavior is set
    shouldEnableI18n = i18nBehavior === "autoYes";
  } else {
    // If prompting is allowed, ask user
    shouldEnableI18n = await confirmPrompt({
      title: "Do you want to enable i18n (internationalization)?",
      displayInstructions: true,
      content: "If `N`, i18n folder won't be created.",
      defaultValue: false,
    });
  }

  // Only proceed with setup if i18n should be enabled
  if (shouldEnableI18n) {
    await setupI18nFiles(projectPath);
  }

  return shouldEnableI18n;
}

/**
 * Decides whether to install deps based on config or user input.
 */
export async function shouldInstallDependencies(
  behavior: Behavior,
  isDev: boolean,
): Promise<boolean> {
  if (behavior === "autoYes") return true;
  if (behavior === "autoNo") return false;
  if (isDev) return false;

  return await confirmPrompt({
    title: "Would you like to install dependencies now?",
    content:
      "- Recommended, but may take time.\n" +
      "- Enables execution of scripts provided by the template.\n" +
      "- Crucial if you've provided a fresh database API key.\n" +
      "- Avoids potential Vercel build failures by ensuring `db:push` is run at least once.\n" +
      "- Allows running additional necessary scripts after installation.",
    defaultValue: true,
  });
}

/**
 * Installs dependencies and checks optional DB push script.
 */
export async function handleDependencies(
  projectPath: string,
  config: RseConfig,
) {
  const depsBehavior: Behavior = config?.depsBehavior ?? "prompt";
  const shouldInstallDeps = await shouldInstallDependencies(depsBehavior, true);

  let shouldRunDbPush = false;
  if (shouldInstallDeps) {
    await installDependencies({ cwd: projectPath });

    // Check if there's a db push script
    const scriptStatus = await promptPackageJsonScripts(
      projectPath,
      shouldRunDbPush,
      true,
    );
    shouldRunDbPush = scriptStatus.dbPush;
  }

  return { shouldInstallDeps, shouldRunDbPush };
}

/**
 * Moves the project from a test runtime directory to a user-specified location.
 */
async function moveProjectFromTestsRuntime(
  projectName: string,
  sourceDir: string,
): Promise<string | null> {
  try {
    const shouldUseProject = await confirmPrompt({
      title: `Project bootstrapped in dev mode. Move to a permanent location? ${experimental}`,
      content:
        "If yes, I'll move it from the tests-runtime directory to a new location you specify.",
      defaultValue: false,
    });

    if (!shouldUseProject) {
      return null;
    }

    /**
     * Chooses a default path based on OS for test -> permanent move.
     */
    function getDefaultProjectPath(): string {
      const platform = os.platform();
      return platform === "win32" ? "C:\\B\\S" : path.join(homeDir, "Projects");
    }

    const defaultPath = getDefaultProjectPath();
    const targetDir = await inputPrompt({
      title: "Where should I move the project?",
      content: "Enter a desired path:",
      placeholder: `Press <Enter> to use default: ${defaultPath}`,
      defaultValue: defaultPath,
    });

    // Ensure the directory exists
    await ensuredir(targetDir);

    // Check if a directory with the same name exists
    let effectiveProjectName = projectName;
    let effectivePath = path.join(targetDir, projectName);
    let counter = 1;

    while (await fs.pathExists(effectivePath)) {
      const newName = await inputPrompt({
        title: `Directory '${effectiveProjectName}' already exists at ${targetDir}`,
        content: "Enter a new name for the project directory:",
        defaultValue: `${projectName}-${counter}`,
        validate: (value: string) =>
          /^[a-zA-Z0-9-_]+$/.test(value)
            ? true
            : "Invalid directory name format",
      });

      effectiveProjectName = newName;
      effectivePath = path.join(targetDir, effectiveProjectName);
      counter++;
    }

    await fs.move(sourceDir, effectivePath);
    relinka("success", `Project moved to ${effectivePath}`);
    return effectivePath;
  } catch (error) {
    relinka("error", "Failed to move project:", String(error));
    return null;
  }
}

/**
 * Shows success info, next steps, and handles final user actions (e.g., open in IDE).
 */
export async function showSuccessAndNextSteps(
  projectPath: string,
  selectedRepo: RepoOption,
  frontendUsername: string,
  isDeployed: boolean,
  primaryDomain: string,
  allDomains: string[],
  skipPrompts: boolean,
  isDev: boolean,
) {
  let effectiveProjectPath = projectPath;

  // If dev mode, offer to move from tests-runtime
  if (isDev && !skipPrompts) {
    const newPath = await moveProjectFromTestsRuntime(
      path.basename(projectPath),
      projectPath,
    );
    if (newPath) {
      effectiveProjectPath = newPath;
    }
  }

  relinka(
    "info",
    `🎉 Template '${selectedRepo}' was installed at ${effectiveProjectPath}`,
  );

  const vscodeInstalled = isVSCodeInstalled();

  await nextStepsPrompt({
    title: "🤘 Project created successfully! Next steps:",
    titleColor: "cyanBright",
    content: [
      `- To open in VSCode: code ${effectiveProjectPath}`,
      `- Or in terminal: cd ${effectiveProjectPath}`,
      "- Install dependencies manually if needed: bun i OR pnpm i",
      "- Apply linting & formatting: bun check OR pnpm check",
      "- Run the project: bun dev OR pnpm dev",
    ],
  });

  if (!skipPrompts) {
    // Run all next actions concurrently
    await handleNextActions(
      isDev,
      effectiveProjectPath,
      vscodeInstalled,
      isDeployed,
      primaryDomain,
      allDomains,
    );
  }

  relinka(
    "success",
    "✨ By the way, one more thing you can try (highly experimental):",
    "👉 Run `rse cli` in your new project to add/remove features.",
  );

  relinka(
    "info",
    frontendUsername !== UNKNOWN_VALUE && frontendUsername !== ""
      ? `👋 More features soon! See you, ${frontendUsername}!`
      : "👋 All done for now!",
  );
}

/**
 * Lets the user select further actions: open in IDE, open docs, etc.
 */
export async function handleNextActions(
  isDev: boolean,
  projectPath: string,
  vscodeInstalled: boolean,
  isDeployed: boolean,
  primaryDomain: string,
  allDomains: string[],
) {
  const nextActions = await multiselectPrompt({
    title: "What would you like to do next?",
    titleColor: "cyanBright",
    defaultValue: ["ide"],
    options: [
      {
        label: "Open Your Default Code Editor",
        value: "ide",
        hint: vscodeInstalled ? "Detected: VSCode-based IDE" : "",
      },
      ...(isDeployed
        ? [
            {
              label: "Open Deployed Project",
              value: "deployed",
              hint: `Visit ${primaryDomain}`,
            },
          ]
        : []),
      {
        label: "Support Reliverse",
        value: "sponsors",
      },
      {
        label: "Join Reliverse Discord",
        value: "discord",
      },
      {
        label: "Open Reliverse docs",
        value: "docs",
      },
    ],
  });

  // Run all actions concurrently to avoid waiting on one to finish before starting the next.
  await Promise.all(
    nextActions.map((action) =>
      handleNextAction(isDev, action, projectPath, primaryDomain, allDomains),
    ),
  );
}

/**
 * Handles a single user-chosen action: open IDE, open docs, etc.
 */
export async function handleNextAction(
  isDev: boolean,
  action: string,
  projectPath: string,
  primaryDomain: string,
  allDomains?: string[],
): Promise<void> {
  try {
    switch (action) {
      case "ide": {
        await askOpenInIDE({ projectPath, enforce: true, isDev });
        break;
      }
      case "deployed": {
        if (allDomains && allDomains.length > 1) {
          const selectedDomain = await selectPrompt({
            title: "Select domain to open:",
            options: allDomains.map((d) => ({
              label: d,
              value: d,
              ...(d === primaryDomain ? { hint: "(primary)" } : {}),
            })),
          });
          relinka(
            "verbose",
            `Opening deployed project at ${selectedDomain}...`,
          );
          await open(`https://${selectedDomain}`);
        } else {
          relinka("verbose", `Opening deployed project at ${primaryDomain}...`);
          await open(`https://${primaryDomain}`);
        }
        break;
      }
      case "sponsors": {
        relinka("verbose", "Opening GitHub Sponsors page...");
        await open("https://github.com/sponsors/blefnk");
        break;
      }
      case "discord": {
        relinka("verbose", "Opening Discord server...");
        await open("https://discord.gg/Pb8uKbwpsJ");
        break;
      }
      case "docs": {
        relinka("verbose", "Opening Reliverse Docs...");
        await open(cliDomainDocs);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    relinka("error", `Error handling action '${action}':`, String(error));
  }
}

/**
 * Creates a new project using the specified template and configuration.
 */
/* export async function createProject(params: {
  projectName: string;
  initialProjectName: string;
  selectedRepo: RepoOption;
  message: string;
  isDev: boolean;
  config: rse;
  memory: rse;
  cwd: string;
  skipPrompts: boolean;
}): Promise<void> {
  const {
    projectName,
    selectedRepo,
    message,
    isDev,
    config,
    memory,
    cwd,
    skipPrompts,
  } = params;

  // Initialize project configuration
  const { frontendUsername, primaryDomain } = await initializeProjectConfig(
    projectName,
    memory,
    config,
    skipPrompts,
    isDev,
    cwd,
  );

  // Create project directory
  const projectPath = isDev
    ? path.join(cwd, "tests-runtime", projectName)
    : path.join(cwd, projectName);

  relinka("info", message);

  try {
    // Download the repository
    const { dir: downloadedPath } = await handleDownload({
      cwd,
      isDev,
      skipPrompts,
      projectPath: "",
      projectName,
      selectedRepo,
      config,
      preserveGit: false,
      isTemplateDownload: true,
      cache: false,
    });

    // Handle dependencies if user wants to install them
    await handleDependencies(downloadedPath, config);

    // Update project configuration
    config.projectTemplate = selectedRepo;

    // Set framework based on template
    if (selectedRepo === "blefnk/relivator-react-native-template") {
      config.projectFramework = "react-native";
      relinka("info", "To start your React Native app, run:");
      relinka("info", `cd ${projectName}`);
      relinka("info", "bun start");
    } else if (selectedRepo === "blefnk/relivator-lynxjs-template") {
      config.projectFramework = "lynx";
      relinka("info", "To start your Lynx app, run:");
      relinka("info", `cd ${projectName}`);
      relinka("info", "bun dev");
    }

    // Show success message and handle next steps
    await showSuccessAndNextSteps(
      downloadedPath,
      selectedRepo,
      frontendUsername,
      false, // isDeployed
      primaryDomain,
      [primaryDomain], // allDomains
      skipPrompts,
      isDev,
    );
  } catch (error) {
    if (error instanceof Error) {
      relinka("error", `Failed to create project: ${error.message}`);
    } else {
      relinka("error", "An unknown error occurred while creating the project");
    }
    // Clean up if project creation failed
    await fs.remove(projectPath).catch((err) => {
      relinka("error", `Failed to clean up project directory: ${err}`);
    });
    throw error;
  }
} */
