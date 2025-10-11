import { generateSecretHash } from "@reliverse/dler";
import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "generateSecret",
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
