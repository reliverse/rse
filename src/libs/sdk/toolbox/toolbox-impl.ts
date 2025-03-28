import { confirmPrompt, selectPrompt } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import path from "pathe";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";
import type { ParamsOmitReli } from "~/libs/sdk/types/types-mod.js";
import type { RepoOption } from "~/libs/sdk/utils/projectRepository.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { FALLBACK_ENV_EXAMPLE_URL } from "~/libs/cfg/constants/cfg-details.js";
import { composeEnvFile } from "~/libs/sdk/init/use-template/cp-modules/compose-env-file/cef-mod.js";
import { promptGitDeploy } from "~/libs/sdk/init/use-template/cp-modules/git-deploy-prompts/gdp-mod.js";
import { experimental } from "~/libs/sdk/utils/badgeNotifiers.js";
import { downloadRepo } from "~/libs/sdk/utils/downloading/downloadRepo.js";
import { askProjectName } from "~/libs/sdk/utils/prompts/askProjectName.js";
import { askUsernameFrontend } from "~/libs/sdk/utils/prompts/askUsernameFrontend.js";
import { cd, pwd, rm } from "~/libs/sdk/utils/terminalHelpers.js";

import { openVercelTools } from "./toolbox-vercel.js";

export async function rmTestsRuntime(cwd: string) {
  const TestsRuntimePath = path.join(cwd, "tests-runtime");
  if (await fs.pathExists(TestsRuntimePath)) {
    const shouldRemoveTestsRuntime = await confirmPrompt({
      title: "Are you sure you want to remove the tests-runtime folder?",
    });
    if (shouldRemoveTestsRuntime) {
      await rm(TestsRuntimePath);
    }
  }
}

export async function downloadRepoOption(
  template: RepoOption,
  config: ReliverseConfig,
  memory: ReliverseMemory,
  isDev: boolean,
  cwd: string,
  skipPrompts: boolean,
) {
  const projectName = await askProjectName({ repoName: "" });
  const primaryDomain = `${projectName}.vercel.app`;
  const { dir } = await downloadRepo({
    repoURL: template,
    projectName,
    isDev,
    cwd,
    isTemplateDownload: false,
  });

  relinka("info", `Downloaded template to ${dir}`);
  await cd(dir);
  pwd();

  const maskInput = await confirmPrompt({
    title:
      "Do you want to mask secret inputs (e.g., GitHub token) in the next steps?",
    content:
      "Regardless of your choice, your data will be securely stored on your device.",
  });

  await composeEnvFile(
    dir,
    FALLBACK_ENV_EXAMPLE_URL,
    maskInput,
    skipPrompts,
    config,
    false, // isMultireli
  );

  const frontendUsername = await askUsernameFrontend(memory, false);
  if (!frontendUsername) {
    throw new Error(
      "Failed to determine your frontend username. Please try again or notify the CLI developers.",
    );
  }

  const { deployService } = await promptGitDeploy({
    isLib: false,
    projectName,
    config,
    projectPath: dir,
    primaryDomain,
    hasDbPush: false,
    shouldRunDbPush: false,
    shouldInstallDeps: false,
    isDev: true,
    memory,
    cwd,
    maskInput: false,
    skipPrompts: false,
    selectedTemplate: "blefnk/relivator-nextjs-template",
    isTemplateDownload: false,
    frontendUsername,
  });

  if (deployService === "none") {
    relinka("info", "Skipping deploy process...");
  } else {
    relinka("success", `Project deployed successfully to ${primaryDomain}`);
  }
}

export async function showDevToolsMenu(params: ParamsOmitReli) {
  const { cwd, isDev, memory, config, skipPrompts } = params;
  const TestsRuntimePath = path.join(cwd, "tests-runtime");
  const TestsRuntimeExists = await fs.pathExists(TestsRuntimePath);

  const toolsOptions = {
    rmTestsRuntime: "rm-tests-runtime",
    downloadTemplate: "download-template",
    openVercelTools: "open-vercel-tools",
    exit: "exit",
  } as const;

  const option = await selectPrompt({
    title: "Dev tools menu",
    options: [
      ...(isDev && TestsRuntimeExists
        ? [
            {
              label: "remove tests-runtime dir",
              value: toolsOptions.rmTestsRuntime,
            },
          ]
        : []),
      ...(isDev
        ? [
            {
              label:
                "downloadRepo + cd(tests-runtime) + composeEnvFile + promptGitDeploy",
              value: toolsOptions.downloadTemplate,
            },
          ]
        : []),
      {
        label: `Open Vercel devtools ${experimental}`,
        value: toolsOptions.openVercelTools,
      },
      { label: "👈 Exit", value: toolsOptions.exit },
    ],
  });

  if (option === toolsOptions.rmTestsRuntime) {
    await rmTestsRuntime(cwd);
  } else if (option === toolsOptions.downloadTemplate) {
    await downloadRepoOption(
      "blefnk/relivator-nextjs-template",
      config,
      memory,
      isDev,
      cwd,
      skipPrompts,
    );
  } else if (option === toolsOptions.openVercelTools) {
    await openVercelTools(memory);
  }
}
