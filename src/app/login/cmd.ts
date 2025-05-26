import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { showAnykeyPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showAnykeyPrompt";
import { auth } from "~/libs/sdk/login/login-impl";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { useLocalhost } from "~/libs/sdk/utils/rseConfig/cfg-details";

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
    const memory = await getReliverseMemory();
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
