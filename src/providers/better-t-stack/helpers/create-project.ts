import path from "node:path";
import { cancel, log, spinner } from "@clack/prompts";
import fs from "@reliverse/relifso";
import pc from "picocolors";
import type { ProjectConfig } from "../types.js";
import { setupAddons } from "./addons-setup.js";
import { setupApi } from "./api-setup.js";
import { setupAuth } from "./auth-setup.js";
import { setupBackendDependencies } from "./backend-framework-setup.js";
import { createReadme } from "./create-readme.js";
import { setupDatabase } from "./db-setup.js";
import { setupEnvironmentVariables } from "./env-setup.js";
import { setupExamples } from "./examples-setup.js";
import { installDependencies } from "./install-dependencies.js";
import { displayPostInstallInstructions } from "./post-installation.js";
import {
  initializeGit,
  updatePackageConfigurations,
} from "./project-config.js";
import { setupRuntime } from "./runtime-setup.js";
import {
  copyBaseTemplate,
  handleExtras,
  setupAddonsTemplate,
  setupAuthTemplate,
  setupBackendFramework,
  setupDbOrmTemplates,
  setupExamplesTemplate,
  setupFrontendTemplates,
} from "./template-manager.js";

export async function createProject(options: ProjectConfig) {
  const projectDir = path.resolve(process.cwd(), options.projectName);
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

    log.success("Project template successfully scaffolded!");

    if (options.install) {
      await installDependencies({
        projectDir,
        packageManager: options.packageManager,
        addons: options.addons,
      });
    }

    displayPostInstallInstructions({
      ...options,
      depsInstalled: options.install,
    });

    return projectDir;
  } catch (error) {
    if (error instanceof Error) {
      cancel(pc.red(`Error during project creation: ${error.message}`));
      console.error(error.stack);
      process.exit(1);
    } else {
      cancel(pc.red(`An unexpected error occurred: ${String(error)}`));
      console.error(error);
      process.exit(1);
    }
  }
}
