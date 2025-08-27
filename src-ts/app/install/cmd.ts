/**
 * USAGE EXAMPLES:
 * - dler install package-name - installs a package
 * - dler install - installs all dependencies
 * - dler dedupe - deduplicates dependencies
 */

import {
  addDependency,
  addToCatalog,
  dedupeDependencies,
  detectPackageManager,
  installDependencies,
  isCatalogSupported,
} from "@reliverse/dler";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand, selectPrompt } from "@reliverse/rempts";

const temp2 = defineCommand({
  meta: {
    name: "install",
    description: "Install global NPM packages or desktop apps",
  },
  args: {
    // The user can optionally specify one or more items to install
    items: {
      type: "positional",
      required: false,
      array: true,
      description: "Apps or packages to install",
    },
  },
  run: async ({ args }) => {
    // If the user provided one or more items, skip interactive menu
    const items = [args.items];
    if (items && items.length > 0) {
      return await handleDirectInstall(items);
    }

    // Otherwise, interactive selection
    relinka("info", "\n◆ Select Installation Type");
    const installType = await selectPrompt({
      title: "installType",
      content: "What do you want to install?",
      options: [
        { value: "cli apps", label: "CLI apps" },
        { value: "desktop apps", label: "Desktop apps" },
      ],
    });

    if (installType === "cli apps") {
      await handleCliApps();
    } else {
      await handleDesktopApps();
    }
  },
});

export default defineCommand({
  meta: {
    name: "install",
    version: "1.1.0",
    description:
      "Install dependencies or deduplicate existing ones. Usage example: `dler install package-name` or `dler install` or `dler dedupe`",
  },
  args: defineArgs({
    action: {
      type: "string",
      description: "Action to perform: install, add, i, dedupe",
      required: false,
      default: "install",
    },
    name: {
      type: "positional",
      description: "Package name",
      required: false,
    },
    global: {
      type: "boolean",
      alias: "g",
      description: "Add globally",
    },
    "frozen-lockfile": {
      type: "boolean",
      description: "Install dependencies with frozen lock file",
    },
    cwd: {
      type: "string",
      description: "Current working directory",
    },
    workspace: {
      type: "boolean",
      description: "Add to workspace",
    },
    silent: {
      type: "boolean",
      description: "Run in silent mode",
    },
    recreateLockFile: {
      type: "boolean",
      description: "Recreate lock file (for dedupe)",
    },
    linter: {
      type: "boolean",
      description: "Run linter checks after updating dependencies",
      default: false,
    },
    filter: {
      type: "array",
      description: "Filter workspaces to operate on (e.g., 'pkg-*', '!pkg-c', './packages/pkg-*')",
    },
    "as-catalog": {
      type: "string",
      description: "Install dependencies as catalog entries (e.g., 'default', 'testing', 'build')",
    },
    "catalog-name": {
      type: "string",
      description: "Name of the catalog to add dependencies to (used with --as-catalog)",
    },
  }),
  async run({ args }) {
    console.log("DEBUG: install command starting with args:", args);

    const {
      action,
      name,
      linter,
      filter,
      "as-catalog": asCatalog,
      "catalog-name": catalogName,
      ...options
    } = args;

    // Handle workspace filtering
    if (filter && filter.length > 0) {
      const packageManager = await detectPackageManager(process.cwd());
      if (packageManager) {
        // Add filter arguments to the options
        (options as any).filter = filter;
      }
    }

    // Handle catalog operations
    if (asCatalog && name) {
      const packageManager = await detectPackageManager(process.cwd());
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

      const dependencies = Array.isArray(name) ? (name as string[]) : [name as string];
      const catalogType = asCatalog === "default" ? "catalog" : "catalogs";
      const actualCatalogName = asCatalog === "default" ? undefined : catalogName || asCatalog;

      await addToCatalog(dependencies, catalogType, actualCatalogName, options.cwd);
      return;
    }

    switch (action) {
      case "install":
      case "i":
      case "add":
        console.log("DEBUG: install case, name:", name, "options:", options);
        await (name ? addDependency(name, options) : installDependencies(options));
        break;

      case "dedupe": {
        await dedupeDependencies(options);
        break;
      }

      default: {
        // If no specific action is provided, default to install behavior
        if (!action || action === "install") {
          console.log("DEBUG: default install case, name:", name, "options:", options);
          await (name ? addDependency(name, options) : installDependencies(options));
        } else {
          relinka.error(`Unknown action: ${action}`);
          relinka.verbose("Available actions: install, add, i, dedupe");
          return process.exit(1);
        }
      }
    }
  },
});
