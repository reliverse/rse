import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "help",
    description: "Displays the help message",
    hidden: true,
  },
  args: {
    dev: {
      type: "boolean",
      description: "Displays the help message for the dev command",
    },
  },
  run: ({ args }) => {
    if (args.dev) {
      relinka("info", "Use `bun dev --help` instead.");
    } else {
      relinka("info", "Use `rse --help` instead.");
    }
    process.exit(0);
  },
});
