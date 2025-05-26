import { validateDevCwd } from "@reliverse/dler-sdk";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { defineCommand } from "@reliverse/rempts";

import { showStartPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt";
import { authCheck } from "~/libs/sdk/login/login-impl";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { cliName, useLocalhost } from "~/libs/sdk/utils/rseConfig/cfg-details";
import { getRseConfig } from "~/libs/sdk/utils/rseConfig/rc-mod";
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

    // Ensure --dev flag is used only within a valid rse dev envi
    await validateDevCwd(isDev, ["cli", "rse"], "rse", "rse");

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
    const { config, multireli } = await getRseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });

    await authCheck(isDev, memory, useLocalhost);
    await app({ cwd, isDev, config, memory, multireli });

    process.exit(0);
  },
});
