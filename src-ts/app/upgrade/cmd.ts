import { commonEndActions, commonStartActions, getCurrentWorkingDirectory } from "@reliverse/dler";
import { callCmd, defineArgs, defineCommand } from "@reliverse/rempts";
import { default as updateCmd } from "~/app/update/cmd";
import { type CmdName, msgs } from "~/const";

export default defineCommand({
  meta: {
    name: "upgrade" as CmdName,
    description: msgs.cmds.upgrade,
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
    const strCwd = String(cwd);
    await commonStartActions({
      isCI,
      isDev,
      strCwd,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: false,
    });

    await callCmd(updateCmd, {
      ...args,
      upgradeTools: true,
    });

    await commonEndActions({ withEndPrompt: false });
  },
});
