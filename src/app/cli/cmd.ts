import { getOrCreateRseConfig } from "@reliverse/cfg";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { defineCommand } from "@reliverse/rempts";

import { cliName, useLocalhost } from "~/libs/sdk/constants";
import { showStartPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt";
import { authCheck } from "~/libs/sdk/login/login-impl";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers";

import { app } from "./impl";

export default defineCommand({
  meta: {
    name: "cli",
    description: `Runs the ${cliName}`,
  },
  args: {
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },
    cwd: {
      type: "string",
      description: "The working directory to run the CLI in",
      required: false,
    },
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    await showStartPrompt(isDev, false);

    let cwd: string;
    if (args.cwd) {
      cwd = args.cwd;
      if (!(await fs.pathExists(cwd))) {
        await ensuredir(cwd);
      }
    } else {
      cwd = getCurrentWorkingDirectory();
    }

    const memory = await getReliverseMemory();
    const { config, mrse } = await getOrCreateRseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });

    await authCheck(isDev, memory, useLocalhost);
    // Get fresh memory after auth check
    const updatedMemory = await getReliverseMemory();
    await app({ cwd, isDev, config, memory: updatedMemory, mrse });

    process.exit(0);
  },
});
