import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { cancel } from "@reliverse/rempts";

import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

import { setupAddons } from "~/libs/sdk/providers/better-t-stack/helpers/setup/addons-setup";
import { setupApi } from "~/libs/sdk/providers/better-t-stack/helpers/setup/api-setup";
import { setupAuth } from "~/libs/sdk/providers/better-t-stack/helpers/setup/auth-setup";
import { setupBackendDependencies } from "~/libs/sdk/providers/better-t-stack/helpers/setup/backend-setup";
import { setupDatabase } from "~/libs/sdk/providers/better-t-stack/helpers/setup/db-setup";
import { setupExamples } from "~/libs/sdk/providers/better-t-stack/helpers/setup/examples-setup";
import { setupRuntime } from "~/libs/sdk/providers/better-t-stack/helpers/setup/runtime-setup";

import { createReadme } from "./create-readme";
import { setupEnvironmentVariables } from "./env-setup";
import { installDependencies } from "./install-dependencies";
import { displayPostInstallInstructions } from "./post-installation";
import { initializeGit, updatePackageConfigurations } from "./project-config";
import {
  copyBaseTemplate,
  handleExtras,
  setupAddonsTemplate,
  setupAuthTemplate,
  setupBackendFramework,
  setupDbOrmTemplates,
  setupExamplesTemplate,
  setupFrontendTemplates,
} from "./template-manager";

export async function createProject(options: ProjectConfig) {
  const projectDir = options.projectDir;
  const isConvex = options.backend === "convex";

  try {
    await fs.ensureDir(projectDir);

    await copyBaseTemplate(projectDir, options);
    await setupFrontendTemplates(projectDir, options);
    await setupBackendFramework(projectDir, options);
    if (!isConvex) {
      await setupDbOrmTemplates(projectDir, options);
      await setupAuthTemplate(projectDir, options);
    }
    if (options.examples.length > 0 && options.examples[0] !== "none") {
      await setupExamplesTemplate(projectDir, options);
    }
    await setupAddonsTemplate(projectDir, options);

    await setupApi(options);

    if (!isConvex) {
      await setupBackendDependencies(options);
      await setupDatabase(options);
      await setupRuntime(options);
      if (options.examples.length > 0 && options.examples[0] !== "none") {
        await setupExamples(options);
      }
    }

    if (options.addons.length > 0 && options.addons[0] !== "none") {
      await setupAddons(options);
    }

    if (!isConvex && options.auth) {
      await setupAuth(options);
    }

    await handleExtras(projectDir, options);
    await setupEnvironmentVariables(options);
    await updatePackageConfigurations(projectDir, options);
    await createReadme(projectDir, options);
    await initializeGit(projectDir, options.git);

    relinka("success", "Project template successfully scaffolded!");

    if (options.install) {
      await installDependencies({
        projectDir,
        packageManager: options.packageManager,
      });
    }

    displayPostInstallInstructions({
      ...options,
      depsInstalled: options.install,
    });

    return projectDir;
  } catch (error) {
    if (error instanceof Error) {
      cancel(re.red(`Error during project creation: ${error.message}`));
    } else {
      cancel(re.red(`An unexpected error occurred: ${String(error)}`));
    }
  }
}
