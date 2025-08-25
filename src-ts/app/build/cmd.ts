import { defineArgs, defineCommand } from "@reliverse/rempts";
import { common } from "~/const/msg";

export default defineCommand({
  meta: {
    name: "build",
    description: "Build the project",
  },
  args: defineArgs({
    ci: {
      type: "boolean",
      description: "Whether to run in CI mode",
    },
    dev: {
      type: "boolean",
      description: "Whether to run in dev mode",
    },
  }),
  run: async ({ args }) => {
    if (args.ci) {
      console.log(common.ci);
    }
    if (args.dev) {
      console.log(common.dev);
    }

    console.log("Building the project... Args:", args);

    process.exit(0);
  },
});
