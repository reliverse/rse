import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { confirmPrompt } from "@reliverse/rempts";
import { projectsCreateProjectEnv } from "@vercel/sdk/funcs/projectsCreateProjectEnv";

import type { InstanceVercel } from "~/libs/sdk/utils/instanceVercel";

import type { DeploymentOptions, EnvVar } from "./vercel-types";

import { getVercelEnvVar, withRateLimit } from "./vercel-api";
import { getEnvVars } from "./vercel-utils";

export async function addEnvVarsToVercelProject(
  vercelInstance: InstanceVercel,
  projectName: string,
  projectPath: string,
  selectedOptions: DeploymentOptions,
): Promise<void> {
  relinka("info", "Setting up environment variables...");
  const envVars = await getEnvVars(projectPath);
  if (envVars.length === 0) {
    return;
  }

  if (selectedOptions.useSharedEnvVars) {
    const shouldUseShared = await confirmPrompt({
      title: `Would you like to use shared environment variables from Vercel.com? ${re.red("[🚨 Experimental]")}`,
      content:
        "Only missing variables will be uploaded from your local .env file",
      defaultValue: false,
    });

    if (shouldUseShared) {
      const existingEnvVars = await getVercelEnvVar(
        vercelInstance,
        projectName,
        envVars[0]?.key ?? "",
      );
      const newEnvVars = envVars.filter(
        (env) => !existingEnvVars?.key.includes(env.key),
      );

      if (newEnvVars.length > 0) {
        await uploadEnvVars(vercelInstance, projectName, newEnvVars);
        relinka(
          "success",
          `Added ${newEnvVars.length} new environment variables`,
        );
        if (existingEnvVars) {
          relinka(
            "info",
            `Kept ${existingEnvVars.key} existing shared variables`,
          );
        }
      } else {
        relinka(
          "info",
          "All required environment variables are already set in Vercel",
        );
      }
    } else {
      await uploadEnvVars(vercelInstance, projectName, envVars);
      relinka("verbose", "Environment variables added successfully");
    }
  } else {
    await uploadEnvVars(vercelInstance, projectName, envVars);
    relinka("verbose", "Environment variables added successfully");
  }
}

/**
 * Uploads environment variables to a Vercel project.
 */
async function uploadEnvVars(
  vercelInstance: InstanceVercel,
  projectName: string,
  envVars: EnvVar[],
): Promise<void> {
  await withRateLimit(async () => {
    const res = await projectsCreateProjectEnv(vercelInstance, {
      idOrName: projectName,
      upsert: "true",
      requestBody: envVars.map((env) => ({
        ...env,
        target: env.target ?? ["production", "preview", "development"],
      })),
    });
    if (!res.ok) {
      throw res.error;
    }
  });
}
