import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { $ } from "bun";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export default defineCommand({
  meta: {
    name: "web",
    // description: "Start the web development server",
    description: "Start the rse web ui",
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Run in development mode",
    },
  }),
  async run({ args }) {
    // Check if running with Bun using process.versions
    if (!process.versions.bun) {
      throw new Error(
        "This command requires Bun runtime. Please install Bun first: https://bun.sh",
      );
    }

    // Get the directory of the current file
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // Resolve the path to the web server file
    const webServerPath = join(__dirname, "index.tsx");

    if (args.dev) {
      // Development mode with hot reloading
      relinka("verbose", "Running in development mode with hot reloading");
      await $`bun --hot ${webServerPath}`;
    } else {
      // Production mode
      relinka("verbose", "Running in production mode");
      await $`NODE_ENV=production bun ${webServerPath}`;
    }
  },
});
