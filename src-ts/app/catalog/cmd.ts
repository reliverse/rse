import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

import { isCatalogSupported, listCatalogs } from "~/app/utils/pm/pm-catalog";
import { detectPackageManager } from "~/app/utils/pm/pm-detect";

export default defineCommand({
  meta: {
    name: "catalog",
    version: "1.0.0",
    description: "Manage dependency catalogs for monorepos. Usage example: `dler catalog list`",
  },
  args: defineArgs({
    action: {
      type: "string",
      description: "Action to perform: list, ls",
      required: false,
      default: "list",
    },
    cwd: {
      type: "string",
      description: "Current working directory",
    },
  }),
  async run({ args }) {
    const { action, cwd } = args;

    // Check if we're in a Bun environment
    const packageManager = await detectPackageManager(cwd || process.cwd());
    if (!packageManager) {
      relinka("error", "Could not detect package manager");
      return process.exit(1);
    }

    if (!isCatalogSupported(packageManager)) {
      relinka(
        "error",
        `Catalogs are not supported by ${packageManager.name}. Only Bun supports catalogs.`,
      );
      return process.exit(1);
    }

    switch (action) {
      case "list":
      case "ls":
        await listCatalogs(cwd || process.cwd());
        break;

      default:
        relinka("error", `Unknown action: ${action}`);
        relinka("verbose", "Available actions: list, ls");
        return process.exit(1);
    }
  },
});
