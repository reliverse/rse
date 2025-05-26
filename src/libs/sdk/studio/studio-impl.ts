import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "studio",
    description: "Provides information on how to open rseo",
    hidden: true,
  },
  run: () => {
    relinka("info", "rse Studio", "Allows you to read and edit rseal memory");
    relinka("info", "To open the editor, run:", "bun db");
    relinka(
      "info",
      "You can also specify a custom port:",
      "bun db --port 4984",
    );
    relinka(
      "info",
      "Don't touch the fields like: code, key, githubKey, vercelKey",
      "They are encrypted and used by rserify your identity",
    );
    process.exit(0);
  },
});
