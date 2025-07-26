import { relinka } from "@reliverse/relinka";
import {
  runMain,
  defineCommand,
  defineArgs,
  selectPrompt,
  showUsage,
  runCmd,
} from "@reliverse/rempts";

import { promptAggCommand } from "./app/agg/run";
import {
  getBuildCmd,
  getPubCmd,
  getUpdateCmd,
  getUpgradeCmd,
} from "./app/cmds";
import {
  showEndPrompt,
  showStartPrompt,
} from "./libs/sdk/sdk-impl/config/info";
import { prepareRseEnvironment } from "./libs/sdk/sdk-impl/config/init";

const MENU_CMDS = ["agg", "build", "pub", "update"];
let isDev = process.env.RSE_DEV_MODE === "true";

const main = defineCommand({
  meta: {
    name: "rse",
    description: `Displays rse's command menu.\nTo see ALL available commands and arguments, run: 'rse --help' (or 'rse <command> --help')\nAvailable menu commands: ${MENU_CMDS.join(", ")}`,
  },
  async onLauncherInit() {
    const isBun = process.versions.bun;
    if (!isBun) {
      relinka(
        "warn",
        "🔥 rse is currently bun-first. support for node.js, deno, and others is experimental until v2.0.",
      );
    }
    await prepareRseEnvironment(isDev);
    relinka("verbose", `Running in ${isDev ? "dev" : "prod"} mode`);
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },
    cwd: {
      type: "string",
      description: "The working directory to run the CLI in",
      default: process.cwd(),
    },
  }),
  async run({ args }) {
    isDev = args.dev;
    const isCI = process.env.CI === "true";
    const isNonInteractive = !process.stdout.isTTY;
    if (isCI || isNonInteractive) {
      relinka(
        "error",
        "Non-interactive mode was detected. Please use `rse --help` to see available non-interactive commands and options.",
      );
      showUsage(main);
      process.exit(0);
    }
    await showStartPrompt(isDev);

    const cmdToRun = await selectPrompt({
      title:
        "Select a command to run (run 'rse --help' to see all available commands)",
      options: [
        { value: "build", label: "build only project" },
        { value: "pub", label: "build+pub project" },
        { value: "upgrade", label: "upgrade dev tools" },
        { value: "update", label: "update all deps" },
        { value: "agg", label: "aggregate" },
        { value: "exit", label: "exit" },
      ],
    });

    switch (cmdToRun) {
      case "build": {
        await runCmd(await getBuildCmd(), [`--dev=${isDev} --no-pub`]);
        break;
      }
      case "pub": {
        await runCmd(await getPubCmd(), [`--dev=${isDev}`]);
        break;
      }
      case "agg": {
        await promptAggCommand();
        break;
      }
      case "update": {
        await runCmd(await getUpdateCmd(), []);
        break;
      }
      case "upgrade": {
        await runCmd(await getUpgradeCmd(), []);
        break;
      }
    }

    await showEndPrompt();
  },
});

await runMain(main);

// ================================================
// DEPRECATED (will be removed soon)
// ================================================

// import { createCli } from "@reliverse/rempts";

// import { createCli, runMain, defineCommand } from "@reliverse/rempts";

// await createCli({});

/* await runMain(
  defineCommand({
    // empty object activates file-based
    // commands in the src/app directory
  }),
); */

/**
 * AVAILABLE COMMANDS
 * `dev:add`
 * `dev:ai`
 * `dev:auth`
 * `dev:cli` <— main command (`bun dev` or `rse cli`)
 * `dev:clone`
 * `dev:cmod`
 * `dev:env`
 * `dev:help`
 * `dev:init`
 * `dev:login`
 * `dev:logout`
 * `dev:memory`
 * `dev:mrse`
 * `dev:schema`
 * `dev:studio`
 * `dev:toolbox`
 * `dev:update`
 * `dev:upload`
 */
