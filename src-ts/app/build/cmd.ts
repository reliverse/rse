import { createPerfTimer, dlerBuild, finalizeBuild, getConfigDler } from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { commonArgs } from "~/impl/args";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

export default defineCommand({
  meta: {
    name: "build" as CmdName,
    description: msgs.cmds.build,
  },
  args: defineArgs({
    ...commonArgs,
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
    const { ci, dev, debugOnlyCopyNonBuildFiles, debugDontCopyNonBuildFiles } = args;

    const timer = createPerfTimer();

    await commonStartActions({ ci, dev });

    const config = await getConfigDler();

    await dlerBuild(timer, dev, config, debugOnlyCopyNonBuildFiles, debugDontCopyNonBuildFiles);

    await finalizeBuild(timer, false, "build");

    await commonEndActions();
  },
});
