import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

import { ensureConfigMod } from "~/app/config/core";
import { type ConfigKind, ensureReliverseConfig } from "./prepare";

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
    mode: {
      type: "string",
      description: "Config mode: copy-remote, copy-internal, create",
      default: "copy-remote",
    },
    tool: {
      type: "string",
      description: "Tool name (e.g., dler, rse)",
      default: "dler",
    },
    update: {
      type: "boolean",
      description: "Force update existing configuration",
      default: false,
    },
    type: {
      type: "string",
      description: "Config file type: ts (TypeScript) or jsonc (JSON with comments)",
      default: "ts",
      choices: ["ts", "jsonc"],
    },
  }),
  run: async ({ args }) => {
    const { dev, mode, tool, update, type } = args;

    try {
      if (mode === "create") {
        // Create a new config file
        const configKind: ConfigKind = type === "jsonc" ? "jsonc" : "ts";
        const isDev = dev;

        await ensureReliverseConfig(isDev, configKind);
        relinka("success", `New ${configKind.toUpperCase()} configuration file has been created`);
      } else {
        // Handle existing modes
        await ensureConfigMod({
          tool,
          mode,
          forceUpdate: update,
        });

        relinka("success", `Configuration for ${tool} has been ${update ? "updated" : "created"}`);
      }
    } catch (error) {
      relinka(
        "error",
        `Failed to manage config: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  },
});
