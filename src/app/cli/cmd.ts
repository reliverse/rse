import { getOrCreateRseConfig } from "@reliverse/cfg";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { cliName, useLocalhost } from "~/libs/sdk/constants";
import { showStartPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt";
import { authCheck } from "~/libs/sdk/login/login-impl";
import { getOrCreateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
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

    if (!process.versions.bun) {
      relinka.warn(
        "Rse is currently optimized for Bun only. Unexpected behavior may occur with other runtimes.",
      );
      relinka.warn(
        "To avoid issues, it's strongly recommended to install Bun: https://bun.sh/get",
      );
      // relinka.log(re.bold("Recommended ways to install and run Rse:"));
      // relinka.log("1) Global install — bun add -g @reliverse/rse && bun rse");
      // relinka.log(
      //   "2) As dev dependency — bun add -D @reliverse/rse && bun rse",
      // );
      // relinka.log("3) Run without installing — bunx @reliverse/rse@latest");
      // relinka.log(
      //   re.italic(
      //     "(p.s. you may want to install it globally and as dev dep in your project)",
      //   ),
      // );
    }

    let cwd: string;
    if (args.cwd) {
      cwd = args.cwd;
      if (!(await fs.pathExists(cwd))) {
        await ensuredir(cwd);
      }
    } else {
      cwd = getCurrentWorkingDirectory();
    }

    const memory = await getOrCreateReliverseMemory();
    const { config, mrse } = await getOrCreateRseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });

    await authCheck(isDev, memory, useLocalhost);
    // Get fresh memory after auth check
    const updatedMemory = await getOrCreateReliverseMemory();
    await app({ cwd, isDev, config, memory: updatedMemory, mrse });

    process.exit(0);
  },
});
