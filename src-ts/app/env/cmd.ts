import { defineCommand } from "@reliverse/rempts";

import { envArgImpl } from "~/app/env/env-impl";

export default defineCommand({
  meta: {
    name: "env",
    description: "Generate .env file",
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
    await envArgImpl(isDev);
  },
});
