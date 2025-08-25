import { createPerfTimer, dlerPub, getConfigDler } from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { commonArgs } from "~/impl/args";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

export default defineCommand({
  meta: {
    name: "deploy" as CmdName,
    description: msgs.cmds.deploy,
  },
  args: defineArgs({
    ...commonArgs,
  }),
  run: async ({ args }) => {
    const { ci, dev } = args;

    const timer = createPerfTimer();

    await commonStartActions({ ci, dev });

    const config = await getConfigDler();

    await dlerPub(timer, dev, config);

    await commonEndActions();
  },
});
