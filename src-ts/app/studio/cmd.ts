import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "studio",
    description: "Provides information on how to open Rse Memory Studio",
    hidden: true,
  },
  run: () => {
    relinka("info", "Rse Memory Studio", "Allows you to read and edit Rse's memory");
    relinka("info", "To open the editor, run:", "bun db");
    relinka("info", "You can also specify a custom port:", "bun db --port 4984");
    relinka(
      "info",
      "Don't touch the fields like: code, key, githubKey, vercelKey",
      "They are encrypted and used by Rse to verify your identity",
    );
    process.exit(0);
  },
});
