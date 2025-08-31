// The command philosophy is: "Find all package.json files, update everything you find, skip only non-updateable specifiers (workspace:, catalog:, npm:, etc.)"

// usage examples (rse=example/ts/app/update/cmd.ts):
// - bun rse update --dryRun --withInstall
// - bun rse update --name "@types/*" --name "react*"     # glob patterns for selective updates
// - bun rse update --ignore "eslint-*" --ignore "@babel/*"  # ignore patterns
// - bun rse update --no-allowMajor                       # conservative updates only

import {
  checkPackageUpdates,
  commonEndActions,
  commonStartActions,
  displayStructuredUpdateResults,
  getCurrentWorkingDirectory,
  handleInstallation,
  prepareAllUpdateCandidates,
  updateAllPackageJsonFiles,
  validatePackageJson,
} from "@reliverse/dler";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { type CmdName, msgs } from "~/const";

// Updates ALL dependencies (prod/dev/peer/optional/catalog) to their latest versions across ALL package.json files found in the project
export default defineCommand({
  meta: {
    name: "update" as CmdName,
    description: msgs.cmds.update,
  },
  args: defineArgs({
    // Common args
    ci: {
      type: "boolean",
      description: msgs.args.ci,
      default: !process.stdout.isTTY || !!process.env["CI"],
    },
    cwd: {
      type: "string",
      description: msgs.args.cwd,
      default: getCurrentWorkingDirectory(),
    },
    // Command specific args
    name: {
      type: "array",
      description:
        "Specific dependencies to update, supports glob patterns (e.g. '@types/*', 'react*')",
    },
    ignore: {
      type: "array",
      description:
        "Dependencies to exclude from updates, supports glob patterns (e.g. 'eslint-*', '@types/*')",
    },
    dryRun: {
      type: "boolean",
      description: "Preview updates without making changes",
    },
    install: {
      type: "boolean",
      description: "Run install after updating",
      alias: "i",
    },
    allowMajor: {
      type: "boolean",
      description: "Allow major version updates (default: true)",
      default: true,
    },
    details: {
      type: "boolean",
      description: "Show detailed dependency information (default: false)",
      alias: "d",
    },
    ignoreFields: {
      type: "array",
      description: "Dependency fields to ignore (e.g., 'peerDependencies,catalog')",
    },
  }),
  run: async ({ args }) => {
    const { ci, cwd, dryRun, install, details, ignoreFields } = args;
    const isCI = Boolean(ci);
    const cwdStr = String(cwd);
    const isDryRun = Boolean(dryRun);
    const showDetails = Boolean(details);
    const fieldsToIgnore = Array.isArray(ignoreFields) ? ignoreFields : [];

    await commonStartActions({
      isCI,
      isDev: false,
      cwdStr,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: false,
    });

    try {
      // Validate package.json exists
      await validatePackageJson();

      // Prepare update candidates
      const { candidates, allDepsMap, packageJsonFiles, fileDepsMap } =
        await prepareAllUpdateCandidates(args);
      if (candidates.length === 0) {
        relinka("log", "No dependencies to update");
        return;
      }

      // Check package updates
      const results = await checkPackageUpdates(candidates, allDepsMap, args);

      // Display results in structured format
      // When details=true: Shows file-by-file breakdown with dependency categories and versions
      // When details=false: Shows simplified summary only
      displayStructuredUpdateResults(results, packageJsonFiles, fileDepsMap, showDetails);

      const toUpdate = results.filter((r) => r.updated && !r.error);
      if (toUpdate.length === 0) {
        return;
      }

      // Exit early for dry run
      if (isDryRun) {
        relinka("log", "Dry run mode - no changes were made");
        return;
      }

      // Update package.json files
      const totalUpdated = await updateAllPackageJsonFiles(
        packageJsonFiles,
        toUpdate,
        "^",
        fieldsToIgnore,
      );

      // Display simple summary
      if (packageJsonFiles.length > 1) {
        relinka(
          "log",
          `Updated ${totalUpdated} dependencies across ${packageJsonFiles.length} package.json files`,
        );
      } else {
        relinka("log", `Updated ${totalUpdated} dependencies`);
      }

      // Handle installation
      if (install) {
        await handleInstallation();
      } else {
        relinka(
          "log",
          "Run 'bun install' to apply the changes (use --install to do this automatically)",
        );
      }
    } catch (error) {
      relinka(
        "error",
        `Failed to update dependencies: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }

    await commonEndActions({ withEndPrompt: false });
  },
});
