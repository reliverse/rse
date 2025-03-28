import { confirmPrompt } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";
import type { RepoOption } from "~/libs/sdk/utils/projectRepository.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { FALLBACK_ENV_EXAMPLE_URL } from "~/libs/cfg/constants/cfg-details.js";
import { handleDownload } from "~/libs/sdk/utils/downloading/handleDownload.js";
import { generateProjectConfigs } from "~/libs/sdk/utils/handlers/generateProjectConfigs.js";
import { isMultireliProject } from "~/libs/sdk/utils/multireliHelpers.js";
import { getReliverseConfigPath } from "~/libs/sdk/utils/reliverseConfig/rc-path.js";
import { updateReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-update.js";
import { handleReplacements } from "~/libs/sdk/utils/replacements/reps-mod.js";

import {
  initializeProjectConfig,
  setupI18nSupport,
  handleDependencies,
  showSuccessAndNextSteps,
} from "./cp-impl.js";
import { composeEnvFile } from "./cp-modules/compose-env-file/cef-mod.js";
import { promptGitDeploy } from "./cp-modules/git-deploy-prompts/gdp-mod.js";

/**
 * Creates a new web project from a template.
 */
export async function createWebProject({
  initialProjectName,
  selectedRepo,
  message,
  isDev,
  config,
  memory,
  cwd,
  skipPrompts,
}: {
  projectName: string;
  initialProjectName: string;
  selectedRepo: RepoOption;
  message: string;
  isDev: boolean;
  config: ReliverseConfig;
  memory: ReliverseMemory;
  cwd: string;
  skipPrompts: boolean;
}): Promise<void> {
  relinka("info", message);

  // -------------------------------------------------
  // 1) Check if the project is a multireli project
  // -------------------------------------------------
  const isMultireli = await isMultireliProject(cwd);
  if (isMultireli) {
    relinka("info", "✅ Multireli mode activated");
  }

  // -------------------------------------------------
  // 2) Initialize project configuration
  // -------------------------------------------------
  const projectConfig = await initializeProjectConfig(
    initialProjectName,
    memory,
    config,
    skipPrompts,
    isDev,
    cwd,
  );
  const {
    frontendUsername,
    projectName,
    primaryDomain: initialDomain,
  } = projectConfig;

  // -------------------------------------------------
  // 3) Download template
  // -------------------------------------------------
  const { dir: projectPath } = await handleDownload({
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

  // -------------------------------------------------
  // 4) Replace placeholders in the template
  // -------------------------------------------------
  const result = await getReliverseConfigPath(projectPath, isDev, skipPrompts);
  if (!result) {
    throw new Error("Failed to get reliverse config path.");
  }
  const { configPath, isTS } = result;
  await handleReplacements(
    projectPath,
    selectedRepo,
    configPath,
    {
      primaryDomain: initialDomain,
      frontendUsername,
      projectName,
    },
    false,
    true,
    true,
  );

  // -------------------------------------------------
  // 5) Remove reliverse config from project if exists
  // -------------------------------------------------
  if (await fs.pathExists(configPath)) {
    relinka("info-verbose", `Removed: ${configPath}, isTS: ${isTS}`);
    await fs.remove(configPath);
  }

  // -------------------------------------------------
  // 6) Setup i18n (auto or prompt-based)
  // -------------------------------------------------
  const enableI18n = await setupI18nSupport(projectPath, config);

  // -------------------------------------------------
  // 7) Ask about masking secrets
  // -------------------------------------------------
  let maskInput = true;
  if (skipPrompts) {
    relinka("info", "Auto-mode: Masking secret inputs by default.");
  } else {
    maskInput = await confirmPrompt({
      title: "Do you want to mask secret inputs?",
      content: "Regardless, your data will be stored securely.",
    });
  }

  // -------------------------------------------------
  // 8) Compose .env files
  // -------------------------------------------------
  await composeEnvFile(
    projectPath,
    FALLBACK_ENV_EXAMPLE_URL,
    maskInput,
    skipPrompts,
    config,
    isMultireli,
  );

  // -------------------------------------------------
  // 9) Handle dependencies (install or not?)
  // -------------------------------------------------
  const { shouldInstallDeps, shouldRunDbPush } = await handleDependencies(
    projectPath,
    config,
  );

  // -------------------------------------------------
  // 10) Generate or update project config files
  // -------------------------------------------------
  await generateProjectConfigs(
    projectPath,
    projectName,
    frontendUsername,
    "vercel",
    initialDomain,
    enableI18n,
    isDev,
  );

  // -------------------------------------------------
  // 11) Deployment flow
  // -------------------------------------------------
  const { deployService, primaryDomain, isDeployed, allDomains } =
    await promptGitDeploy({
      isLib: false,
      projectName,
      config,
      projectPath,
      primaryDomain: initialDomain,
      hasDbPush: shouldRunDbPush,
      shouldRunDbPush,
      shouldInstallDeps,
      isDev,
      memory,
      cwd,
      maskInput,
      skipPrompts,
      selectedTemplate: selectedRepo,
      isTemplateDownload: false,
      frontendUsername,
    });

  // If the user changed domain or deploy service, update reliverse config again
  if (deployService !== "vercel" || primaryDomain !== initialDomain) {
    await updateReliverseConfig(
      projectPath,
      {
        projectDeployService: deployService,
        projectDomain: primaryDomain,
      },
      isDev,
    );
  }

  // -------------------------------------------------
  // 12) Final success & next steps
  // -------------------------------------------------
  await showSuccessAndNextSteps(
    projectPath,
    selectedRepo,
    frontendUsername,
    isDeployed,
    primaryDomain,
    allDomains,
    skipPrompts,
    isDev,
  );
}

/**
 * Creates a new mobile project from a template.
 */
export async function createMobileProject({
  initialProjectName,
  selectedRepo,
  message,
  isDev,
  config,
  memory,
  cwd,
  skipPrompts,
}: {
  projectName: string;
  initialProjectName: string;
  selectedRepo: RepoOption;
  message: string;
  isDev: boolean;
  config: ReliverseConfig;
  memory: ReliverseMemory;
  cwd: string;
  skipPrompts: boolean;
}): Promise<void> {
  relinka("info", message);

  // -------------------------------------------------
  // 1) Initialize project configuration
  // -------------------------------------------------
  const projectConfig = await initializeProjectConfig(
    initialProjectName,
    memory,
    config,
    skipPrompts,
    isDev,
    cwd,
  );
  const {
    frontendUsername,
    projectName,
    primaryDomain: initialDomain,
  } = projectConfig;

  // -------------------------------------------------
  // 2) Download template
  // -------------------------------------------------
  const { dir: projectPath } = await handleDownload({
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

  // -------------------------------------------------
  // 3) Replace placeholders in the template
  // -------------------------------------------------
  const result = await getReliverseConfigPath(projectPath, isDev, skipPrompts);
  if (!result) {
    throw new Error("Failed to get reliverse config path.");
  }
  const { configPath, isTS } = result;
  await handleReplacements(
    projectPath,
    selectedRepo,
    configPath,
    {
      primaryDomain: initialDomain,
      frontendUsername,
      projectName,
    },
    false,
    true,
    true,
  );

  // -------------------------------------------------
  // 4) Remove reliverse config from project if exists
  // -------------------------------------------------
  if (await fs.pathExists(configPath)) {
    relinka("info-verbose", `Removed: ${configPath}, isTS: ${isTS}`);
    await fs.remove(configPath);
  }

  // -------------------------------------------------
  // 5) Handle dependencies (install or not?)
  // -------------------------------------------------
  await handleDependencies(projectPath, config);

  // -------------------------------------------------
  // 6) Set framework based on template
  // -------------------------------------------------
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

  // -------------------------------------------------
  // 7) Generate or update project config files
  // -------------------------------------------------
  await generateProjectConfigs(
    projectPath,
    projectName,
    frontendUsername,
    "none", // No deployment service for mobile projects
    initialDomain,
    false, // No i18n for mobile projects yet
    isDev,
  );

  // -------------------------------------------------
  // 8) Final success & next steps
  // -------------------------------------------------
  await showSuccessAndNextSteps(
    projectPath,
    selectedRepo,
    frontendUsername,
    false, // isDeployed
    initialDomain,
    [initialDomain], // allDomains
    skipPrompts,
    isDev,
  );
}
