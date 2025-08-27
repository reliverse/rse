import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { useLocalhost } from "~/app/config/constants";
import { showAnykeyPrompt } from "~/app/init/use-template/cp-modules/cli-main-modules/modules/showAnykeyPrompt";
import { auth } from "~/app/login/login-impl";
import { getOrCreateReliverseMemory } from "~/app/utils/reliverseMemory";

export default defineCommand({
  meta: {
    name: "login",
    description: "Authenticate your device",
    hidden: true,
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run the CLI in dev mode",
    },
  },
  run: async ({ args }) => {
    const isDev = args.dev;

    // Check for existing keys in SQLite
    const memory = await getOrCreateReliverseMemory();
    const isAuthenticated = memory.code && memory.key;

    if (isAuthenticated) {
      relinka("success", "You're already logged in.");
      if (isDev) {
        relinka("info", "Try `bun dev:logout` cmd.");
      } else {
        relinka("info", "Try `rse logout` cmd.");
      }
      process.exit(0);
    }

    await showAnykeyPrompt();
    await auth({ isDev, useLocalhost });

    if (isDev) {
      relinka("success", "You can run `bun dev` now! Happy Reliversing! 🎉");
    } else {
      relinka("success", "You can run `rse cli` now! Happy Reliversing! 🎉");
    }
    process.exit(0);
  },
});
