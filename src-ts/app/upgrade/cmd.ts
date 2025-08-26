import { getCurrentWorkingDirectory } from "@reliverse/dler";
import { callCmd, defineArgs, defineCommand } from "@reliverse/rempts";
import { default as updateCmd } from "~/app/update/cmd";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

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
    await commonStartActions({ isCI, isDev, strCwd });

    await callCmd(updateCmd, {
      ...args,
      "upgrade-tools": true,
    });

    await commonEndActions();
  },
});
