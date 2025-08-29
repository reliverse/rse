import {
  commonEndActions,
  commonStartActions,
  createPerfTimer,
  dlerPub,
  getConfigDler,
  getCurrentWorkingDirectory,
} from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { type CmdName, msgs } from "~/const";

export default defineCommand({
  meta: {
    name: "publish" as CmdName,
    description: msgs.cmds.publish,
  },
  args: defineArgs({
    // Common args
    ci: {
      type: "boolean",
      description: msgs.args.ci,
      default: !process.stdout.isTTY || !!process.env["CI"],
    },
    cwd: {
      type: "string",
      description: msgs.args.cwd,
      default: getCurrentWorkingDirectory(),
    },
    dev: {
      type: "boolean",
      description: msgs.args.dev,
    },
    // Command specific args
    "no-spinner": {
      type: "boolean",
      description: "Disable progress spinners and show detailed publish logs",
    },
    "force-spinner": {
      type: "boolean",
      description: "Force enable spinners even in CI/non-TTY environments",
    },
  }),
  run: async ({ args }) => {
    const { ci, cwd, dev, "no-spinner": noSpinner, "force-spinner": forceSpinner } = args;
    const isCI = Boolean(ci);
    const isDev = Boolean(dev);
    const cwdStr = String(cwd);
    await commonStartActions({
      isCI,
      isDev,
      cwdStr,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: true,
    });
    const timer = createPerfTimer();
    const config = await getConfigDler();

    // CLI-specific spinner overrides
    if (noSpinner) {
      config.displayBuildPubLogs = true; // Force detailed logs
    }
    if (forceSpinner) {
      config.displayBuildPubLogs = false; // Force spinners
    }

    await dlerPub(timer, isDev, config);

    await commonEndActions({ withEndPrompt: true });
  },
});
