import { createPerfTimer, dlerPub, getConfigDler } from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { commonArgs } from "~/impl/args";
import { msgs } from "~/impl/msgs";
import type { CmdName } from "~/impl/types";
import { commonEndActions, commonStartActions } from "~/impl/utils";

export default defineCommand({
  meta: {
    name: "update" as CmdName,
    description: msgs.cmds.update,
  },
  args: defineArgs({
    ...commonArgs,
    name: {
      type: "array",
      description: "Specific dependencies to update (default: all dependencies)",
    },
    ignore: {
      type: "array",
      description: "Dependencies to exclude from updates",
    },
    "dev-only": {
      type: "boolean",
      description: "Update only devDependencies",
    },
    "prod-only": {
      type: "boolean",
      description: "Update only dependencies (production)",
    },
    "peer-only": {
      type: "boolean",
      description: "Update only peerDependencies",
    },
    "optional-only": {
      type: "boolean",
      description: "Update only optionalDependencies",
    },
    "catalogs-only": {
      type: "boolean",
      description: "Update ONLY catalog dependencies (catalogs are included by default)",
    },
    "dry-run": {
      type: "boolean",
      description: "Preview updates without making changes",
    },
    concurrency: {
      type: "number",
      description: "Number of concurrent version checks",
      default: 5,
    },
    "with-check-script": {
      type: "boolean",
      description: "Run `bun check` after updating (Bun only)",
    },
    linker: {
      type: "string",
      description: "Linker strategy: 'isolated' for monorepos, 'hoisted' for single packages",
      allowed: ["isolated", "hoisted"],
      default: "hoisted",
    },
    "with-install": {
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
    "all-workspaces": {
      type: "boolean",
      description: "Update dependencies across all workspace packages (requires --no-recursive)",
    },
    "root-only": {
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
    "save-prefix": {
      type: "string",
      description: "Version prefix: '^', '~', or 'none' for exact",
      allowed: ["^", "~", "none"],
      default: "^",
    },
    "allow-major": {
      type: "boolean",
      description:
        "Allow major version updates to latest available (disable with --no-allow-major)",
      default: true,
    },
  }),
  run: async ({ args }) => {
    const { ci, dev } = args;

    const timer = createPerfTimer();

    await commonStartActions({ ci, dev });

    const config = await getConfigDler();

    await dlerPub(timer, dev, config);

    await commonEndActions();
  },
});
