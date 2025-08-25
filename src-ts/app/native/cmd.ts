import { defineArgs, defineCommand } from "@reliverse/rempts";
import { commonArgs } from "~/impl/args";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

export default defineCommand({
  meta: {
    name: "native" as CmdName,
    description: msgs.cmds.native,
  },
  args: defineArgs({
    ...commonArgs,
    kind: {
      type: "string",
      allowed: ["rust", "bun", "go"],
      required: true,
    },
  }),
  run: async ({ args }) => {
    const { ci, dev } = args;

    await commonStartActions({ ci, dev });

    console.log("Installing Rse CLI native binaries... Args:", args);

    await commonEndActions();
  },
});
