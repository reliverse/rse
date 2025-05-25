import { defineCommand } from "@reliverse/rempts";

import { showDevToolsMenu } from "~/libs/sdk/toolbox/toolbox-impl.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getRseConfig } from "~/libs/sdk/utils/rseConfig/rc-mod.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

export default defineCommand({
  meta: {
    name: "studio",
    description: "Provides information on how to open rseo",
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
    const { config } = await getRseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });
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
