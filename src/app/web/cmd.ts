import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { $ } from "bun";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export default defineCommand({
  meta: {
    name: "web",
    description: "Start the rse web ui",
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Run in development mode",
    },
  }),
  async run({ args }) {
    if (!process.versions.bun) {
      throw new Error(
        "This command requires Bun runtime. Please install Bun first: https://bun.sh/get",
      );
    }

    // Get the directory of the current file
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // Resolve the path to the web server file
    const webServerPath = join(__dirname, "index.tsx");

    if (args.dev) {
      relinka(
        "warn",
        "[isDev=true] It's recommended to use `bun dev:web` instead to get fully correct hot reloading.",
      );
      await $`bun --watch ${webServerPath}`;
    } else {
      await $`NODE_ENV=production bun ${webServerPath}`;
    }
  },
});
