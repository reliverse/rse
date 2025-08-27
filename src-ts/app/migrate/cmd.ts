import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { confirmPrompt, defineArgs, defineCommand } from "@reliverse/rempts";
import { isMonorepo } from "~/app/update/utils";
import { isCatalogSupported } from "~/app/utils/pm/pm-catalog";
import { detectPackageManager } from "~/app/utils/pm/pm-detect";
import { migrateAnythingToBun } from "./codemods/anything-bun";
import { consoleToRelinka } from "./codemods/console-relinka";
import { migrateFsToRelifso } from "./codemods/fs-relifso";
import {
  displayMigrationResults,
  type MigrationResult,
  migrateFromCatalog,
  migrateToCatalog,
} from "./codemods/monorepo-catalog";
import { migrateModuleResolution } from "./codemods/nodenext-bundler";
import { migratePathToPathkit } from "./codemods/path-pathkit";
import { migrateReaddirToGlob } from "./codemods/readdir-glob";

type LogFormat =
  | "console"
  | "consolaMethod"
  | "consolaObject"
  | "relinkaFunction"
  | "relinkaMethod"
  | "relinkaObject";

export default defineCommand({
  meta: {
    name: "migrate",
    version: "1.0.0",
    description: "Migrate between different libraries and usages",
  },
  args: defineArgs({
    interactive: {
      type: "boolean",
      description: "Interactive mode",
      default: true,
    },
    codemod: {
      type: "string",
      description:
        "The migration to perform (anything-bun | path-pathkit | fs-relifso | nodenext-bundler | readdir-glob | console-relinka | catalog-migration)",
    },
    project: {
      type: "string",
      description: "Project directory to migrate (default: current directory)",
      default: ".",
    },
    mrTarget: {
      type: "string",
      description: "Target for module resolution migration (nodenext | bundler)",
      default: "nodenext",
    },
    dryRun: {
      type: "boolean",
      description: "Preview changes without applying them",
    },
    noBackup: {
      type: "boolean",
      description: "Skip creating backup files",
      default: false,
    },
    consoleRelinkaInput: {
      type: "string",
      description:
        "Input file or directory path. Specify to convert your project between different logging formats (console, consola method/object, relinka function/method/object).",
    },
    consoleRelinkaFrom: {
      type: "string",
      description:
        "Source format (console, consolaMethod, consolaObject, relinkaFunction, relinkaMethod, relinkaObject)",
    },
    consoleRelinkaTo: {
      type: "string",
      description:
        "Target format (console, consolaMethod, consolaObject, relinkaFunction, relinkaMethod, relinkaObject)",
    },
    // Catalog migration specific arguments
    "to-catalog": {
      type: "boolean",
      description:
        "Migrate workspace dependencies to workspaces.catalog and replace with catalog references (use with codemod: catalog-migration)",
    },
    "from-catalog": {
      type: "boolean",
      description:
        "Restore catalog references to actual versions from workspaces.catalog (use with codemod: catalog-migration)",
    },
    "remove-catalog": {
      type: "boolean",
      description:
        "Remove workspaces.catalog from root package.json after restoring (only with --from-catalog)",
    },
  }),
  async run({ args }) {
    if (args.interactive) {
      const confidence = await confirmPrompt({
        title: `This is an experimental feature and probably may broke some things.\nIt will be improved in the future.\nAre you sure you want to migrate files in ${args.project}?`,
        defaultValue: false,
      });
      if (!confidence) {
        throw new Error("Migration cancelled");
      }
    }

    if (args.codemod === "anything-bun") {
      relinka("verbose", "Migrating to Bun...");
      await migrateAnythingToBun({
        project: args.project,
        dryRun: args.dryRun,
        noBackup: args.noBackup,
      });
      if (!args.dryRun) {
        relinka("verbose", "\nMigration completed!");
        relinka("verbose", "Next steps:");
        relinka("verbose", "1. Run 'bun install' to install dependencies with Bun");
        relinka("verbose", "2. Test your application thoroughly");
        relinka("verbose", "3. Review async/await usage in converted file operations");
        relinka("verbose", "4. Update any custom database queries to use Bun.sql syntax");
        relinka("verbose", "5. Review and update any custom middleware in Express apps");
      }
      return;
    }

    if (args.codemod === "catalog-migration") {
      await handleCatalogMigration(args);
      return;
    }

    let results: any[] = [];

    if (args.codemod === "path-pathkit") {
      relinka("verbose", "Migrating from node:path and/or pathe to @reliverse/pathkit...");
      results = await migratePathToPathkit(args.dryRun);
    } else if (args.codemod === "fs-relifso") {
      relinka("verbose", "Migrating from node:fs and/or fs-extra to @reliverse/relifso...");
      results = await migrateFsToRelifso(args.dryRun);
    } else if (args.codemod === "nodenext-bundler") {
      if (!["nodenext", "bundler"].includes(args.mrTarget)) {
        relinka("error", `Invalid mrTarget: ${args.mrTarget}`);
        relinka("verbose", "Available targets:");
        relinka("verbose", "  - nodenext");
        relinka("verbose", "  - bundler");
        return;
      }
      relinka("verbose", `Migrating to ${args.mrTarget} module resolution...`);
      results = await migrateModuleResolution(args.mrTarget as "nodenext" | "bundler", args.dryRun);
    } else if (args.codemod === "readdir-glob") {
      relinka("verbose", "Migrating from fs.readdir to globby...");
      results = await migrateReaddirToGlob(args.dryRun);
    } else if (args.codemod === "console-relinka") {
      relinka("verbose", "Migrating logging format...");
      await consoleToRelinka(
        args.consoleRelinkaInput,
        args.consoleRelinkaFrom as LogFormat,
        args.consoleRelinkaTo as LogFormat,
      );
      return;
    } else {
      relinka("error", `Unknown migration: ${args.codemod}`);
      relinka("verbose", "Available migrations:");
      relinka("verbose", "  - anything-bun");
      relinka("verbose", "  - path-pathkit");
      relinka("verbose", "  - fs-relifso");
      relinka("verbose", "  - nodenext-bundler");
      relinka("verbose", "  - readdir-glob");
      relinka("verbose", "  - console-relinka");
      relinka("verbose", "  - catalog-migration");
      return;
    }

    // print results
    relinka("info", "\nMigration Results:");
    let successCount = 0;
    let errorCount = 0;
    let warningCount = 0;

    for (const result of results) {
      const status = result.success ? "✓" : "✗";
      relinka("verbose", `${status} ${result.file}: ${result.message}`);

      if (result.changes && result.changes.length > 0) {
        for (const change of result.changes) {
          if (change.startsWith("⚠️")) {
            relinka("verbose", `    ${change}`);
            warningCount++;
          } else {
            relinka("verbose", `    - ${change}`);
          }
        }
      }

      if (result.success) successCount++;
      else errorCount++;
    }

    relinka(
      "log",
      `\nSummary: ${successCount} files updated, ${errorCount} errors, ${warningCount} warnings`,
    );

    if (args.dryRun) {
      relinka("info", "\nThis was a dry run. No changes were made.");
      relinka("verbose", "Run without --dryRun to apply the changes.");
    } else {
      relinka("success", "\nMigration completed!");

      if (args.codemod === "path-pathkit") {
        relinka("verbose", "Next steps:");
        relinka("verbose", "1. Run 'bun install' to install @reliverse/pathkit");
        relinka("verbose", "2. Test your application");
        relinka(
          "verbose",
          "3. Tip: Consider using advanced pathkit features like alias resolution",
        );
      } else if (args.codemod === "fs-relifso") {
        relinka("verbose", "Next steps:");
        relinka("verbose", "1. Run 'bun install' to install @reliverse/relifso");
        relinka("verbose", "2. Test your application");
        relinka("verbose", "3. Review any file system operations that might need manual updates");
      } else if (args.codemod === "nodenext-bundler") {
        relinka("verbose", "Next steps:");
        relinka("verbose", "1. Test your application");
        if (args.mrTarget === "nodenext") {
          relinka("verbose", "2. Ensure your build tools support .js extensions in imports");
        } else if (args.mrTarget === "bundler") {
          relinka("verbose", "2. Ensure your bundler is configured correctly");
        }
        if (warningCount > 0) {
          relinka("warn", "3. ⚠️  Review files with warnings - they may need manual updates");
        }
      } else if (args.codemod === "readdir-glob") {
        relinka("verbose", "Next steps:");
        relinka("verbose", "1. Run 'bun install' to install globby");
        relinka("verbose", "2. Test your application");
        relinka("verbose", "3. Review any file system operations that might need manual updates");
      }
    }
  },
});

async function handleCatalogMigration(args: any): Promise<void> {
  try {
    // Validate catalog migration arguments
    if (!args["to-catalog"] && !args["from-catalog"]) {
      relinka("error", "Must specify either --to-catalog or --from-catalog");
      return process.exit(1);
    }

    if (args["to-catalog"] && args["from-catalog"]) {
      relinka("error", "Cannot specify both --to-catalog and --from-catalog");
      return process.exit(1);
    }

    if (args["remove-catalog"] && !args["from-catalog"]) {
      relinka("error", "--remove-catalog can only be used with --from-catalog");
      return process.exit(1);
    }

    const cwd = process.cwd();
    const packageJsonPath = path.resolve(cwd, "package.json");

    // Check if package.json exists
    if (!(await fs.pathExists(packageJsonPath))) {
      relinka("error", "No package.json found in current directory");
      return process.exit(1);
    }

    // Check if we're in a monorepo
    if (!(await isMonorepo(cwd))) {
      relinka("error", "This command requires a monorepo with workspace configuration");
      return process.exit(1);
    }

    // Check if package manager supports catalogs
    const packageManager = await detectPackageManager(cwd);
    if (!packageManager) {
      relinka("warn", "Could not detect package manager");
    } else if (!isCatalogSupported(packageManager)) {
      relinka(
        "warn",
        `Catalogs may not be fully supported by ${packageManager.name}. Only Bun has full catalog support.`,
      );
    }

    let results: MigrationResult[] = [];

    if (args["to-catalog"]) {
      relinka("log", "Migrating workspace dependencies to catalog...");
      results = await migrateToCatalog(cwd, !!args.dryRun, !!args.interactive);
    } else if (args["from-catalog"]) {
      relinka("log", "Restoring dependencies from catalog...");
      results = await migrateFromCatalog(
        cwd,
        !!args["remove-catalog"],
        !!args.dryRun,
        !!args.interactive,
      );
    }

    // Display results
    displayMigrationResults(results);

    if (args.dryRun) {
      relinka("info", "This was a dry run - no actual changes were made");
    }
  } catch (error) {
    relinka(
      "error",
      `Catalog migration failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}
