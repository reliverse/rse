import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

import { generateSecretHash } from "~/app/auth/(utils)/generate-secret.js";

export default defineCommand({
  meta: {
    name: "secret",
    version: "1.1.2",
  },
  args: defineArgs({}),
  async run() {
    const secret = generateSecretHash();
    relinka(
      "info",
      `\nAdd the following to your .env file: 
${re.gray("# Auth Secret") + re.green(`\nBETTER_AUTH_SECRET=${secret}`)}`,
    );
  },
});
