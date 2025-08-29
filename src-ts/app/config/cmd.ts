import { type ConfigKind, ensureReliverseConfig } from "@reliverse/dler";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "config",
    description: "Manage project-level and device-global configurations",
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },
    type: {
      type: "string",
      description: "Config file type: ts (TypeScript) or jsonc (JSON with comments)",
      default: "ts",
      choices: ["ts", "jsonc"],
    },
  }),
  run: async ({ args }) => {
    const { dev, type } = args;

    try {
      // Create a new config file
      const configKind: ConfigKind = type === "jsonc" ? "jsonc" : "ts";
      const isDev = dev;

      await ensureReliverseConfig(isDev, configKind);
      relinka("success", `New ${configKind.toUpperCase()} configuration file has been created`);
    } catch (error) {
      relinka(
        "error",
        `Failed to manage config: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  },
});
