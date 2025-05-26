import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { showManualBuilderMenu } from "~/libs/sdk/init/init-impl";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { getRseConfig } from "~/libs/sdk/utils/rseConfig/rc-mod";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers";

export default defineCommand({
  meta: {
    name: "add",
    description:
      "Create, customize, and integrate new or existing projects with rses",
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
      description: "Select a rse",
    },
    target: {
      type: "string",
      description: "Path to the file or directory (skips Relinter's prompt)",
    },
  },
  subCommands: {
    rule: () =>
      import("~/libs/sdk/add/add-rule/add-rule-mod").then((r) => r.default),
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    if (isDev) {
      relinka("verbose", "Using dev mode");
    }

    const cwd = getCurrentWorkingDirectory();
    const { config } = await getRseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });
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
