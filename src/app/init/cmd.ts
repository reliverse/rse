import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { showManualBuilderMenu } from "~/libs/sdk/init/init-impl.js";
import { initMinimalrseProject } from "~/libs/sdk/init/init-utils.js";
import { askProjectName } from "~/libs/sdk/utils/prompts/askProjectName.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getRseConfig } from "~/libs/sdk/utils/rseConfig/rc-mod.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

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
      description:
        "Path to the directory (opens project selector if not provided)",
      required: false,
    },
  },
  run: async ({ args }) => {
    try {
      const { dev: isDev, target } = args;
      const cwd = getCurrentWorkingDirectory();

      // Retrieve project memory and configuration
      const memory = await getReliverseMemory();
      const { config } = await getRseConfig({
        projectPath: cwd,
        isDev,
        overrides: {},
      });

      // Validate and normalize the target argument
      const trimmedTarget = typeof target === "string" ? target.trim() : "";
      const explicitTargetProvided = trimmedTarget.length > 0;
      // If no explicit target is provided, ask for the project name
      const projectName = explicitTargetProvided
        ? trimmedTarget
        : await askProjectName({});

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
