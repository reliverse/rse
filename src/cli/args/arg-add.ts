import { defineCommand } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

import { showManualBuilderMenu } from "~/libs/sdk/init/init-impl.js";
import { getReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

export default defineCommand({
  meta: {
    name: "add",
    description:
      "Create, customize, and integrate new or existing projects with Reliverse Addons",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run the CLI in dev mode",
    },
    generate: {
      type: "string",
      description: "Generate a new project",
    },
    agent: {
      type: "string",
      description: "Select a Reliverse Agent",
    },
    target: {
      type: "string",
      description: "Path to the file or directory (skips Relinter's prompt)",
    },
  },
  subCommands: {
    rule: () =>
      import("~/libs/sdk/add/add-rule/add-rule-mod.js").then((r) => r.default),
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    if (isDev) {
      relinka("log-verbose", "Using dev mode");
    }

    const cwd = getCurrentWorkingDirectory();
    const { config } = await getReliverseConfig(cwd, isDev, {});
    const memory = await getReliverseMemory();
    await showManualBuilderMenu({
      cwd,
      isDev,
      config,
      memory,
      projectName: "",
      skipPrompts: false,
    });

    process.exit(0);
  },
});
