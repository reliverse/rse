import { defineCommand } from "@reliverse/rempts";

import { getOrCreateRseConfig } from "~/libs/sdk/cfg/rc-mod";
import { showDevToolsMenu } from "~/libs/sdk/toolbox/toolbox-impl";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers";

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
    const { config } = await getOrCreateRseConfig({
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
