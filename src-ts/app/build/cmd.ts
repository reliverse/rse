import {
  createPerfTimer,
  dlerBuild,
  finalizeBuild,
  getConfigDler,
  getCurrentWorkingDirectory,
} from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

export default defineCommand({
  meta: {
    name: "build" as CmdName,
    description: msgs.cmds.build,
  },
  args: defineArgs({
    // Common args
    ci: {
      type: "boolean",
      description: msgs.args.ci,
      default: !process.stdout.isTTY || !!process.env["CI"],
    },
    dev: {
      type: "boolean",
      description: msgs.args.dev,
    },
    cwd: {
      type: "string",
      description: msgs.args.cwd,
      default: getCurrentWorkingDirectory(),
    },
    // Command specific args
    debugOnlyCopyNonBuildFiles: {
      type: "boolean",
      description: "Only copy non-build files to dist directories",
    },
    debugDontCopyNonBuildFiles: {
      type: "boolean",
      description:
        "Don't copy non-build files to dist directories, only build buildPreExtensions files",
    },
  }),
  run: async ({ args }) => {
    const { ci, cwd, dev, debugOnlyCopyNonBuildFiles, debugDontCopyNonBuildFiles } = args;
    const isCI = Boolean(ci);
    const isDev = Boolean(dev);
    const strCwd = String(cwd);
    const isDebugOnlyCopyNonBuildFiles = Boolean(debugOnlyCopyNonBuildFiles);
    const isDebugDontCopyNonBuildFiles = Boolean(debugDontCopyNonBuildFiles);
    await commonStartActions({ isCI, isDev, strCwd });

    const timer = createPerfTimer();
    const config = await getConfigDler();
    await dlerBuild(
      timer,
      isDev,
      config,
      isDebugOnlyCopyNonBuildFiles,
      isDebugDontCopyNonBuildFiles,
    );
    await finalizeBuild(timer, false, "build");

    await commonEndActions();
  },
});
