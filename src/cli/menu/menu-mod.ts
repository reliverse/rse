import { selectPrompt } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import fs from "fs-extra";
import path from "pathe";

import type {
  ReliverseConfig,
  ProjectCategory,
} from "~/libs/cfg/constants/cfg-types.js";
import type { AppParams } from "~/libs/sdk/types/types-mod.js";
import type { RepoOption } from "~/libs/sdk/utils/projectRepository.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { getRandomMessage } from "~/db/messages.js";
import { endTitle, UNKNOWN_VALUE } from "~/libs/cfg/constants/cfg-details.js";
import { handleOpenProjectMenu } from "~/libs/sdk/init/manual-mode/deprecated/editor-menu.js";
import { createMobileProject } from "~/libs/sdk/init/use-template/cp-mod.js";
import { experimental } from "~/libs/sdk/utils/badgeNotifiers.js";
import { detectProjectsWithReliverse } from "~/libs/sdk/utils/reliverseConfig/rc-detect.js";

import {
  optionCreateBrowserExtension,
  optionCreateVSCodeExtension,
  optionCreateWebProject,
} from "./menu-impl.js";

async function handleProjectCategory(params: AppParams) {
  const { cwd, isDev, memory, config, multireli, skipPrompts } = params;

  let projectCategory = config.projectCategory;
  if (projectCategory === UNKNOWN_VALUE) {
    const selectedType = await selectPrompt<ProjectCategory>({
      endTitle,
      title: getRandomMessage("initial"),
      options: [
        {
          label: "Web Application",
          value: "website",
          hint: re.dim("Create a website with Next.js"),
        },
        {
          label: "Mobile Application",
          value: "mobile",
          hint: experimental,
        },
        {
          label: "VS Code Extension",
          value: "vscode",
          hint: experimental,
        },
        {
          label: "Browser Extension",
          value: "browser",
          hint: experimental,
        },
        {
          label: "CLI Project",
          value: "cli",
          hint: experimental,
        },
        { separator: true },
        {
          label: re.italic(
            re.dim("More types of projects and frameworks coming soon 🦾"),
          ),
          value: UNKNOWN_VALUE,
          disabled: true,
        },
      ],
    });
    projectCategory = selectedType;
  }

  if (projectCategory === "vscode") {
    await optionCreateVSCodeExtension(
      params.projectName,
      cwd,
      isDev,
      memory,
      config,
      skipPrompts,
    );
  } else if (projectCategory === "browser") {
    await optionCreateBrowserExtension(
      params.projectName,
      cwd,
      isDev,
      memory,
      config,
      skipPrompts,
    );
  } else if (projectCategory === "mobile") {
    await optionCreateMobileProject(
      params.projectName,
      cwd,
      isDev,
      memory,
      config,
      skipPrompts,
    );
  } else {
    // Default = "web"
    await optionCreateWebProject(
      params.projectName,
      cwd,
      isDev,
      memory,
      config,
      false,
      multireli,
      skipPrompts,
    );
  }
}

/**
 * Creates a new mobile project based on the selected framework
 */
async function optionCreateMobileProject(
  projectName: string,
  cwd: string,
  isDev: boolean,
  memory: ReliverseMemory,
  config: ReliverseConfig,
  skipPrompts: boolean,
): Promise<void> {
  const mobileFramework = await selectPrompt({
    endTitle,
    title: "Which mobile framework would you like to use?",
    options: [
      {
        label: "Lynx",
        value: "lynx",
        hint: re.dim("iOS • Android • Web"),
      },
      {
        label: "React Native",
        value: "react-native",
        hint: re.dim("iOS • Android • Web • macOS • Windows"),
      },
    ],
  });

  let selectedRepo: RepoOption;
  if (mobileFramework === "react-native") {
    selectedRepo = "blefnk/relivator-react-native-template" as RepoOption;
  } else if (mobileFramework === "lynx") {
    selectedRepo = "blefnk/relivator-lynxjs-template" as RepoOption;
  } else {
    relinka("error", "Invalid mobile framework selected");
    return;
  }

  await createMobileProject({
    projectName,
    initialProjectName: projectName,
    selectedRepo,
    message: `Setting up ${mobileFramework} project...`,
    isDev,
    config,
    memory,
    cwd,
    skipPrompts,
  });
}

/**
 * Main entry point to show user a new project menu
 */
export async function showNewProjectMenu(params: AppParams): Promise<void> {
  const { cwd, isDev, memory, config, multireli, skipPrompts, projectName } =
    params;

  const isMultiConfig = multireli.length > 0;

  if (isMultiConfig) {
    relinka(
      "info",
      "Continuing with the multi-config mode (currently only web projects are supported)...",
    );
    await optionCreateWebProject(
      projectName,
      cwd,
      isDev,
      memory,
      config,
      isMultiConfig,
      multireli,
      skipPrompts,
    );
  } else {
    await handleProjectCategory(params);
  }
}

export async function showOpenProjectMenu(params: AppParams) {
  const { cwd, isDev, memory, config } = params;

  const searchPath = isDev ? path.join(cwd, "tests-runtime") : cwd;
  if (await fs.pathExists(searchPath)) {
    const detectedProjects = await detectProjectsWithReliverse(
      searchPath,
      isDev,
    );
    await handleOpenProjectMenu(
      detectedProjects,
      isDev,
      memory,
      cwd,
      true,
      config,
    );
  }
}
