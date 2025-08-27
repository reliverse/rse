import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";
import { getOrCreateReliverseConfig } from "~/app/config/core-cfg";
import { showManualBuilderMenu } from "~/app/init/init-utils/init-impl";
import { getOrCreateReliverseMemory } from "~/app/utils/reliverseMemory";
import { getCurrentWorkingDirectory } from "~/app/utils/terminalHelpers";

export default defineCommand({
  meta: {
    name: "add",
    description: "Create, customize, and integrate new or existing projects with rses",
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
    rule: () => import("~/app/add/add-rule/add-rule-mod").then((r) => r.default),
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    if (isDev) {
      relinka("verbose", "Using dev mode");
    }

    const cwd = getCurrentWorkingDirectory();
    const { config } = await getOrCreateReliverseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });
    const memory = await getOrCreateReliverseMemory();
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
