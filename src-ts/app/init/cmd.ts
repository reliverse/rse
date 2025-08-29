// rse cmd is your buddy for bootstrapping the boring stuff, so you can jump straight into building the good stuff.

import {
  askProjectName,
  getCurrentWorkingDirectory,
  getOrCreateReliverseConfig,
  getOrCreateReliverseMemory,
  initMinimalrseProject,
  showManualBuilderMenu,
} from "@reliverse/dler";
import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize a new rse project with minimal setup",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Runs in dev mode",
      required: false,
    },
    target: {
      type: "string",
      description: "Path to the directory (opens project selector if not provided)",
      required: false,
    },
  },
  run: async ({ args }) => {
    try {
      const { dev: isDev, target } = args;
      const cwd = getCurrentWorkingDirectory();

      // Retrieve project memory and configuration
      const memory = await getOrCreateReliverseMemory();
      const { config } = await getOrCreateReliverseConfig({
        projectPath: cwd,
        isDev,
        overrides: {},
      });

      // Validate and normalize the target argument
      const trimmedTarget = typeof target === "string" ? target.trim() : "";
      const explicitTargetProvided = trimmedTarget.length > 0;
      // If no explicit target is provided, ask for the project name
      const projectName = explicitTargetProvided ? trimmedTarget : await askProjectName({});

      // Determine the project path; in dev mode, place it inside tests-runtime folder
      const projectPath = isDev
        ? path.resolve(cwd, `tests-runtime/${projectName}`)
        : path.resolve(cwd, projectName);

      // Ensure the project directory does not already exist
      if (await fs.pathExists(projectPath)) {
        throw new Error(`Project directory ${projectPath} already exists`);
      }

      // Initialize the project based on whether an explicit target was provided
      if (explicitTargetProvided) {
        await initMinimalrseProject(projectPath, projectName, isDev);
      } else {
        await showManualBuilderMenu({
          projectName,
          cwd,
          isDev,
          memory,
          config,
          skipPrompts: false,
        });
      }

      relinka("success", "Project initialization completed successfully.");
      process.exit(0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        relinka("error", "Error during project initialization:", error.message);
      } else {
        relinka("error", "Error during project initialization:", String(error));
      }
      process.exit(1);
    }
  },
});
