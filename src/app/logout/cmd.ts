import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { confirmPrompt, defineCommand } from "@reliverse/rempts";
import { deleteLastLine, msg } from "@reliverse/rempts";

import { memoryPath } from "~/libs/sdk/constants";
import { deleteMemory } from "~/libs/sdk/logout/logout-impl";

const isConfigExists = async () => {
  if (await fs.pathExists(memoryPath)) {
    return true;
  }
  return false;
};

export default defineCommand({
  meta: {
    name: "logout",
    description: "Ask rse to forget your data",
    hidden: true,
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run the CLI in dev mode",
    },
  },
  run: async ({ args }) => {
    if (!(await isConfigExists())) {
      relinka("success", "You're not logged in.");
      if (args.dev) {
        relinka("info", "Try `bun dev:login` cmd.");
      }
      process.exit(0);
    }
    const danger = await confirmPrompt({
      title:
        "Are you sure you want to log out? rse will delete its local memory. This action cannot be undone.",
      titleColor: "redBright",
    });
    if (danger) {
      await deleteMemory();
      deleteLastLine();
      msg({
        type: "M_BAR",
        borderColor: "dim",
      });
      relinka("success", "You're logged out now! 👋");
      process.exit(0);
    }
  },
});
