import { commonEndActions, commonStartActions, getCurrentWorkingDirectory } from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { type CmdName, msgs } from "~/const";

export default defineCommand({
  meta: {
    name: "native" as CmdName,
    description: msgs.cmds.native,
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
    kind: {
      type: "string",
      allowed: ["bun", "go", "rust", "app"],
      required: true,
    },
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

    // TODO: get rse app ui tauri binary
    // await callCmd(installCmd, {});

    await commonEndActions({ withEndPrompt: true });
  },
});
