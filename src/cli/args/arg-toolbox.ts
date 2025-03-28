import { defineCommand } from "@reliverse/prompts";

import { showDevToolsMenu } from "~/libs/sdk/toolbox/toolbox-impl.js";
import { getReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

export default defineCommand({
  meta: {
    name: "studio",
    description: "Provides information on how to open Reliverse Studio",
    hidden: true,
  },
  args: {
    dev: {
      type: "boolean",
      default: false,
    },
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    const cwd = getCurrentWorkingDirectory();
    const { config } = await getReliverseConfig(cwd, isDev, {});
    const memory = await getReliverseMemory();
    await showDevToolsMenu({
      projectName: "",
      cwd,
      isDev,
      config,
      memory,
      skipPrompts: false,
    });
    process.exit(0);
  },
});
