import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { selectPrompt } from "@reliverse/rempts";

import type { InstanceGithub } from "~/libs/sdk/utils/instanceGithub.js";
import type { InstanceVercel } from "~/libs/sdk/utils/instanceVercel.js";
import type { RseConfig } from "~/libs/sdk/utils/rseConfig/cfg-types.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";
import type { DeploymentService } from "~/types.js";

import { prepareVercelProjectCreation } from "./vercel/vercel-create.js";

export async function selectDeploymentService(
  config: RseConfig,
): Promise<DeploymentService> {
  if (
    config.projectDeployService !== undefined &&
    config.projectDeployService !== "none"
  ) {
    const deployService = config.projectDeployService;
    relinka("verbose", `Using configured deployment service: ${deployService}`);
    return deployService;
  }

  return await selectPrompt<DeploymentService>({
    title: "Select deployment service",
    options: [
      { label: "Vercel", value: "vercel", hint: "recommended" },
      { label: "None", value: "none", hint: "skip deployment" },
      {
        label: "...",
        value: "deno",
        hint: re.dim("coming soon"),
        disabled: true,
      },
    ],
    defaultValue: "vercel",
  });
}

export async function deployProject(
  githubInstance: InstanceGithub,
  vercelInstance: InstanceVercel,
  vercelToken: string,
  githubToken: string,
  skipPrompts: boolean,
  projectName: string,
  config: RseConfig,
  projectPath: string,
  primaryDomain: string,
  memory: ReliverseMemory,
  deployMode: "new" | "update",
  githubUsername: string,
): Promise<{
  deployService: DeploymentService | "none";
  primaryDomain: string;
  isDeployed: boolean;
  allDomains: string[];
}> {
  relinka("verbose", `Preparing deployment for ${projectName} project...`);

  try {
    const deployService = await selectDeploymentService(config);
    if (deployService === "none") {
      relinka("info", "Skipping deployment...");
      return {
        primaryDomain,
        deployService: "none",
        isDeployed: false,
        allDomains: [primaryDomain],
      };
    }

    if (deployService !== "vercel") {
      relinka("info", `Deployment to ${deployService} is not yet implemented`);
      return {
        primaryDomain,
        deployService: "none",
        isDeployed: false,
        allDomains: [primaryDomain],
      };
    }

    const success = await prepareVercelProjectCreation(
      githubInstance,
      vercelInstance,
      vercelToken,
      githubToken,
      skipPrompts,
      projectName,
      projectPath,
      primaryDomain,
      memory,
      deployMode,
      githubUsername,
    );

    if (success) {
      relinka("verbose", "Deployment completed!");
      return {
        primaryDomain,
        deployService: deployService,
        isDeployed: true,
        allDomains: [primaryDomain],
      };
    } else {
      relinka("error", "Failed to deploy project");
      return {
        primaryDomain,
        deployService: "none",
        isDeployed: false,
        allDomains: [primaryDomain],
      };
    }
  } catch (error) {
    relinka(
      "error",
      "Error during deployment:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      primaryDomain,
      deployService: "none",
      isDeployed: false,
      allDomains: [primaryDomain],
    };
  }
}
