import {
  createPerfTimer,
  dlerPub,
  getConfigDler,
  getCurrentWorkingDirectory,
} from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

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
    const strCwd = String(cwd);
    await commonStartActions({ isCI, isDev, strCwd });

    const timer = createPerfTimer();
    const config = await getConfigDler();
    await dlerPub(timer, isDev, config);

    await commonEndActions();
  },
});
