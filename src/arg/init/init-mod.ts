import { defineCommand } from "@reliverse/prompts";
import path from "pathe";

import { askProjectName } from "~/app/prompts/askProjectName.js";
import { showManualBuilderMenu } from "~/arg/add/add-impl.js";
import { initMinimalReliverseProject } from "~/arg/add/add-local/core/projects.js";
import { getReliverseConfig } from "~/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/utils/terminalHelpers.js";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize a new Reliverse project with minimal setup",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Runs in dev mode",
      required: false,
    },
    new: {
      type: "boolean",
      description:
        "Inits a new project (CLI opens project selector if --new is not provided)",
      required: false,
    },
    target: {
      type: "string",
      description: "Path to the directory",
      required: false,
    },
  },
  run: async ({ args }) => {
    const { dev: isDev, new: isNew, target } = args;
    const cwd = getCurrentWorkingDirectory();

    const memory = await getReliverseMemory();
    const { config } = await getReliverseConfig(cwd, isDev, {});

    if (isNew) {
      // If user explicitly wants to init a new project
      const isNonInteractive = target === "";
      const nameOrTarget = target || (await askProjectName({}));

      // In dev mode, place the project inside tests-runtime
      const projectPath = isDev
        ? path.resolve(cwd, `tests-runtime/${nameOrTarget}`)
        : path.resolve(cwd, nameOrTarget);

      await initMinimalReliverseProject(
        projectPath,
        nameOrTarget,
        isDev,
        isNonInteractive,
      );
    } else {
      // When not explicitly new, we handle the "existing or local directory" path
      // Derive some default projectName from either target or current directory
      const projectName = target ? path.basename(target) : path.basename(cwd);

      await showManualBuilderMenu({
        projectName,
        cwd,
        isDev,
        memory,
        config,
        skipPrompts: false,
      });
    }

    process.exit(0);
  },
});
