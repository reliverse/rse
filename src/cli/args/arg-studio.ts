import { defineCommand } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

export default defineCommand({
  meta: {
    name: "studio",
    description: "Provides information on how to open Reliverse Studio",
    hidden: true,
  },
  run: () => {
    relinka(
      "info",
      "Reliverse Studio",
      "Allows you to read and edit Reliverse's local memory",
    );
    relinka("info", "To open the editor, run:", "bun db");
    relinka(
      "info",
      "You can also specify a custom port:",
      "bun db --port 4984",
    );
    relinka(
      "info",
      "Don't touch the fields like: code, key, githubKey, vercelKey",
      "They are encrypted and used by Reliverse to verify your identity",
    );
    process.exit(0);
  },
});
