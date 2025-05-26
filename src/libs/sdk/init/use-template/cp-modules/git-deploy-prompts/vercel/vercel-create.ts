import { relinka } from "@reliverse/relinka";
import { confirmPrompt } from "@reliverse/rempts";
import { projectsAddProjectDomain } from "@vercel/sdk/funcs/projectsAddProjectDomain";
import { projectsCreateProject } from "@vercel/sdk/funcs/projectsCreateProject";

import type { InstanceGithub } from "~/libs/sdk/utils/instanceGithub";
import type { InstanceVercel } from "~/libs/sdk/utils/instanceVercel";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

import { isSpecialDomain } from "~/libs/sdk/init/use-template/cp-modules/git-deploy-prompts/helpers/domainHelpers";
import { updateReliverseMemory } from "~/libs/sdk/sdk-mod";

import { withRateLimit } from "./vercel-api";
import {
  configureBranchProtection,
  configureResources,
  enableAnalytics,
  getConfigurationOptions,
} from "./vercel-config";
import { createInitialVercelDeployment } from "./vercel-deploy";
import { addEnvVarsToVercelProject } from "./vercel-env";
import { detectFramework, verifyDomain } from "./vercel-utils";

/**
 * Creates a new Vercel project.
 */
export async function createVercelProject(
  projectName: string,
  projectPath: string,
  vercelInstance: InstanceVercel,
): Promise<string> {
  relinka("info", "Creating new Vercel project...");
  const framework = await detectFramework(projectPath);
  const createProjectRes = await withRateLimit(async () =>
    projectsCreateProject(vercelInstance, {
      requestBody: {
        name: projectName,
        framework,
        gitRepository: {
          type: "github",
          repo: projectName,
        },
      },
    }),
  );
  if (!createProjectRes.ok) {
    throw createProjectRes.error;
  }
  const projectId = createProjectRes.value.id;
  relinka("verbose", `Project created with ID: ${projectId}`);
  return projectId;
}

/**
 * Prepares a new Vercel project creation by:
 * 1. Retrieving configuration options.
 * 2. Creating the project in the Vercel registry.
 * 3. Running additional configuration tasks (analytics, protection and resources).
 * 4. (Optionally) setting up a custom domain.
 * 5. Uploading environment variables.
 * 6. Creating the initial deployment.
 */
export async function prepareVercelProjectCreation(
  githubInstance: InstanceGithub,
  vercelInstance: InstanceVercel,
  vercelToken: string,
  githubToken: string,
  skipPrompts: boolean,
  projectName: string,
  projectPath: string,
  domain: string,
  memory: ReliverseMemory,
  deployMode: "new" | "update",
  githubUsername: string,
): Promise<boolean> {
  if (!vercelToken) {
    throw new Error(
      "Vercel token not found in rse's memory. Please restart the CLI and try again. Notify the @reliverse/rse developers if the problem persists.",
    );
  }

  try {
    const selectedOptions =
      deployMode === "new" || skipPrompts
        ? { options: ["env"] }
        : await getConfigurationOptions();

    // Always create a new project.
    const projectId = await createVercelProject(
      projectName,
      projectPath,
      vercelInstance,
    );

    // Configure analytics, branch protection, and resources if selected.
    if (selectedOptions.options.includes("analytics")) {
      await enableAnalytics(vercelInstance, projectId);
    }
    if (selectedOptions.options.includes("protection")) {
      await configureBranchProtection(vercelInstance, projectId);
    }
    if (selectedOptions.options.includes("resources")) {
      await configureResources(vercelInstance, projectId);
    }

    // Custom domain setup.
    if (!isSpecialDomain(domain) && domain !== `${projectName}.vercel.app`) {
      let shouldAddDomain = false;
      if (!skipPrompts) {
        shouldAddDomain = await confirmPrompt({
          title: `Do you want to add ${domain} to your Vercel project?`,
          content: `If not, a ${projectName}.vercel.app domain will be created automatically. You can always add a custom domain later in the dashboard.`,
        });
      }
      if (!shouldAddDomain) {
        relinka("info", "Skipping custom domain configuration");
      } else {
        relinka("info", "Setting up custom domain...");
        try {
          const addDomainRes = await projectsAddProjectDomain(vercelInstance, {
            idOrName: projectName,
            requestBody: { name: domain },
          });
          if (!addDomainRes.ok) {
            throw addDomainRes.error;
          }
          const verified = await verifyDomain(
            vercelInstance,
            projectId,
            domain,
          );
          if (!verified) {
            relinka(
              "warn",
              "Domain not verified. Complete verification in the dashboard.",
            );
          }
        } catch (error) {
          relinka(
            "warn",
            "Failed to set up custom domain. You can add it later:",
            error instanceof Error ? error.message : String(error),
          );
        }
      }
    }

    // Environment variables phase.
    if (selectedOptions.options.includes("env")) {
      await addEnvVarsToVercelProject(
        vercelInstance,
        projectName,
        projectPath,
        {
          options: selectedOptions.options,
          useSharedEnvVars: false,
        },
      );
    }

    // Create initial deployment.
    const deployment = await createInitialVercelDeployment(
      githubInstance,
      vercelInstance,
      projectId,
      memory,
      projectName,
      { framework: await detectFramework(projectPath) },
      {
        includes: (option: string) => selectedOptions.options.includes(option),
      },
      githubUsername,
      githubToken,
    );

    relinka("success", `Deployment preview URL: https://${deployment.url}`);
    relinka("verbose", "✅ Deployment completed successfully!");

    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        relinka(
          "error",
          "Vercel API rate limit exceeded. Please try again later.",
        );
      } else if (error.message.includes("network")) {
        relinka("error", "Network error. Please check your connection.");
      } else if (error.message.includes("unauthorized")) {
        relinka(
          "error",
          "Invalid/expired Vercel token. Please provide a new token.",
        );
        await updateReliverseMemory({ vercelKey: "" });
      } else {
        relinka("error", "Error creating Vercel deployment:", error.message);
      }
    } else {
      relinka("error", "Unexpected error during deployment");
    }
    return false;
  }
}
