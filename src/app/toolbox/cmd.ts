import { getOrCreateRseConfig } from "@reliverse/cfg";
import { defineCommand } from "@reliverse/rempts";

import { showDevToolsMenu } from "~/libs/sdk/toolbox/toolbox-impl";
import { getOrCreateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
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
    const memory = await getOrCreateReliverseMemory();
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
