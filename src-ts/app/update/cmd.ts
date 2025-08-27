// usage example: bun src-ts/dler.ts update --dryRun --withInstall

import {
  checkPackageUpdates,
  commonEndActions,
  commonStartActions,
  displayUpdateResults,
  displayUpdateSummary,
  getCurrentWorkingDirectory,
  getEffectiveLinker,
  handleCatalogOnlyUpdate,
  handleGlobalUpdates,
  handleInstallation,
  handleInteractiveSelection,
  handleRecursiveUpdates,
  handleToolUpgrades,
  handleWorkspaceUpdates,
  isMonorepo,
  prepareUpdateCandidates,
  updateRootPackageJson,
  validatePackageJson,
  validateUpdateArgs,
} from "@reliverse/dler";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { readPackageJSON } from "pkg-types";
import { type CmdName, msgs } from "~/const";

// By default tool recursively updates all dependencies to their latest available versions including catalogs.
// Finds and updates ALL package.json files in the directory tree by default.
// Use --no-recursive with --allWorkspaces or --rootOnly for workspace-based behavior.
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
    dev: {
      type: "boolean",
      description: msgs.args.dev,
    },
    // Command specific args
    name: {
      type: "array",
      description: "Specific dependencies to update (default: all dependencies)",
    },
    ignore: {
      type: "array",
      description: "Dependencies to exclude from updates",
    },
    devOnly: {
      type: "boolean",
      description: "Update only devDependencies",
    },
    prodOnly: {
      type: "boolean",
      description: "Update only dependencies (production)",
    },
    peerOnly: {
      type: "boolean",
      description: "Update only peerDependencies",
    },
    optionalOnly: {
      type: "boolean",
      description: "Update only optionalDependencies",
    },
    catalogsOnly: {
      type: "boolean",
      description: "Update ONLY catalog dependencies (catalogs are included by default)",
    },
    dryRun: {
      type: "boolean",
      description: "Preview updates without making changes",
    },
    concurrency: {
      type: "number",
      description: "Number of concurrent version checks",
      default: 5,
    },
    withCheckScript: {
      type: "boolean",
      description: "Run `bun check` after updating (Bun only)",
    },
    linker: {
      type: "string",
      description: "Linker strategy: 'isolated' for monorepos, 'hoisted' for single packages",
      allowed: ["isolated", "hoisted"],
      default: "hoisted",
    },
    withInstall: {
      type: "boolean",
      description: "Run install after updating",
      alias: "with-i",
    },
    global: {
      type: "boolean",
      description: "Update global packages",
      alias: "g",
    },
    interactive: {
      type: "boolean",
      description: "Interactively select dependencies to update",
    },
    filter: {
      type: "array",
      description: "Filter workspaces (e.g., 'pkg-*', '!pkg-c')",
    },
    allWorkspaces: {
      type: "boolean",
      description: "Update dependencies across all workspace packages (requires --no-recursive)",
    },
    rootOnly: {
      type: "boolean",
      description: "Update only the root package.json (requires --no-recursive)",
    },
    recursive: {
      type: "boolean",
      description:
        "Recursively find and update ALL package.json files in current directory tree (default: true, use --no-recursive to disable)",
      alias: "r",
      default: true,
    },
    savePrefix: {
      type: "string",
      description: "Version prefix: '^', '~', or 'none' for exact",
      allowed: ["^", "~", "none"],
      default: "^",
    },
    allowMajor: {
      type: "boolean",
      description: "Allow major version updates to latest available (disable with --no-allowMajor)",
      default: true,
    },
    upgradeTools: {
      type: "boolean",
      description: "Upgrade system development tools (dler, git, node.js, npm, bun, yarn, pnpm)",
      alias: "upgrade",
    },
  }),
  run: async ({ args }) => {
    const {
      ci,
      cwd,
      dev,
      global,
      interactive,
      concurrency,
      recursive,
      allowMajor,
      upgradeTools,
      savePrefix,
      allWorkspaces,
      rootOnly,
      dryRun,
    } = args;
    const isCI = Boolean(ci);
    const isDev = Boolean(dev);
    const strCwd = String(cwd);
    const isGlobal = Boolean(global);
    const isInteractive = Boolean(interactive);
    const isUpgradeTools = Boolean(upgradeTools);
    const isRecursive = Boolean(recursive);
    const isAllowMajor = Boolean(allowMajor);
    const isAllWorkspaces = Boolean(allWorkspaces);
    const isRootOnly = Boolean(rootOnly);
    const strSavePrefix = String(savePrefix);
    const numConcurrency = Number(concurrency);
    const isDryRun = Boolean(dryRun);
    await commonStartActions({
      isCI,
      isDev,
      strCwd,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: false,
    });

    try {
      // Handle tool upgrades
      if (isUpgradeTools) {
        await handleToolUpgrades(args);
        return;
      }

      // Validate arguments for dependency updates
      await validateUpdateArgs(args);

      // Handle global package updates
      if (isGlobal) {
        return await handleGlobalUpdates(args);
      }

      // Handle catalog-only updates
      const catalogUpdated = await handleCatalogOnlyUpdate(args);
      if (catalogUpdated) {
        return;
      }

      // Validate package.json exists
      const packageJsonPath = await validatePackageJson();

      // Get effective linker strategy
      const { effectiveLinker } = await getEffectiveLinker(args);

      // Prepare update candidates
      const { candidates, allDepsMap } = await prepareUpdateCandidates(args);
      if (candidates.length === 0) {
        return;
      }

      // Check package updates
      const results = await checkPackageUpdates(candidates, allDepsMap, args);

      // Display results
      displayUpdateResults(results);

      let toUpdate = results.filter((r) => r.updated && !r.error);
      if (toUpdate.length === 0) {
        return;
      }

      // Handle interactive selection
      if (isInteractive) {
        toUpdate = await handleInteractiveSelection(results);
        if (toUpdate.length === 0) {
          return;
        }
      }

      // Exit early for dry run
      if (isDryRun) {
        relinka("log", "Dry run mode - no changes were made");
        return;
      }

      // Update root package.json
      const rootUpdated = await updateRootPackageJson(
        packageJsonPath,
        allDepsMap,
        toUpdate,
        strSavePrefix,
      );

      let totalUpdated = rootUpdated;

      // Prepare options for recursive/workspace updates
      const options = {
        allowMajor: !!isAllowMajor,
        savePrefix: strSavePrefix,
        concurrency: numConcurrency || 5,
      };

      // Handle recursive updates
      if (isRecursive) {
        const recursiveUpdated = await handleRecursiveUpdates(args, options);
        totalUpdated += recursiveUpdated;
      } else {
        // Handle workspace updates
        const isMonorepoProject = await isMonorepo(process.cwd());
        const shouldUpdateWorkspaces = isAllWorkspaces || (!isRootOnly && isMonorepoProject);

        const workspaceUpdated = await handleWorkspaceUpdates(args, options);
        totalUpdated += workspaceUpdated;

        // Display summary
        displayUpdateSummary(totalUpdated, args, isMonorepoProject, shouldUpdateWorkspaces);
      }

      // Handle installation
      const packageJson = await readPackageJSON();
      await handleInstallation(args, effectiveLinker, packageJson);
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
