import { ensuredir } from "@reliverse/fs";
import { defineCommand } from "@reliverse/prompts";
import { validateDevCwd } from "@reliverse/relidler-sdk";
import fs from "fs-extra";

import { cliName, useLocalhost } from "~/libs/cfg/constants/cfg-details.js";
import { showStartPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt.js";
import { authCheck } from "~/libs/sdk/login/login-impl.js";
import { getReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

import { app } from "./cli-impl.js";

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

    // Ensure --dev flag is used only within a valid reliverse dev envi
    await validateDevCwd(isDev, ["cli", "reliverse"], "reliverse", "reliverse");

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
    const { config, multireli } = await getReliverseConfig(cwd, isDev, {});

    await authCheck(isDev, memory, useLocalhost);
    await app({ cwd, isDev, config, memory, multireli });

    process.exit(0);
  },
});
