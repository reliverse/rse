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
    name: "deploy" as CmdName,
    description: msgs.cmds.deploy,
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
    // ...
  }),
  run: async ({ args }) => {
    const { ci, cwd, dev } = args;
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
    await dlerPub(timer, isDev, config);

    await commonEndActions({ withEndPrompt: true });
  },
});
