// todo: finish migration from "@reliverse/PROMPTS" to "@reliverse/REMPTS"

import { validateDevCwd } from "@reliverse/dler-sdk";
import { defineCommand, runMain } from "@reliverse/rempts";

/**
 * Main command defined using `defineCommand()`.
 *
 * This command demonstrates the full range of launcher features along with all supported argument types:
 *
 * - Global Usage Handling: Automatically processes `--help` and `--version`.
 * - File-Based Subcommands: Scans "src/cli/args" for subcommands (e.g., `init`).
 * - Comprehensive Argument Parsing: Supports positional, boolean, string, number, and array arguments.
 * - Interactive Prompts: Uses built-in prompt functions for an engaging CLI experience.
 */
const mainCommand = defineCommand({
  meta: {
    name: "rse",
    version: "1.7.0",
    description: "rse cli https://docs.reliverse.org",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },
  },
  async run({ args }) {
    const isDev = args.dev;

    // if (isDev) {
    //   relinka("info", "[dler debug] Running in dev mode:", raw);
    //   relinka("info", "[dler debug] args:", args);
    //   relinka("info", "[dler debug] raw args:", raw);
    // }

    // Ensure --dev flag is used only within a valid dler dev env
    await validateDevCwd(isDev, ["rse"], "rse", "rse");
  },
});

/**
 * The `runMain()` function sets up the launcher with several advanced features:
 *
 * - File-Based Subcommands: Enables scanning for subcommands within the "src/cli/args" directory.
 * - Alias Mapping: Shorthand flags (e.g., `-v`) are mapped to their full names (e.g., `--verbose`).
 * - Strict Mode & Unknown Flag Warnings: Unknown flags are either warned about or handled via a callback.
 * - Negated Boolean Support: Allows flags to be negated (e.g., `--no-verbose`).
 * - Custom Unknown Flag Handler: Provides custom handling for unrecognized flags.
 */
await runMain(mainCommand, {
  // fileBasedCmds: {
  //   enable: true, // Enables file-based subcommand detection.
  //   cmdsRootPath: "src/cli/args", // Directory to scan for subcommands.
  // },
  strict: false, // Do not throw errors for unknown flags.
  warnOnUnknown: false, // Warn when encountering unknown flags.
  // negatedBoolean: true, // Support for negated booleans (e.g., --no-verbose).
  // unknown: (flagName) => {
  //   relinka("warn", "Unknown flag encountered:", flagName);
  //   return false;
  // },
  // TODO: unknownErrorMsg: "An unhandled error occurred, please report it at https://github.com/rse/dler"
});

/* import { defineCommand, errorHandler, runMain } from "@reliverse/rempts";

import { cliDomainDocs, cliVersion } from "./libs/cfg/constants/cfg-details";

const main = defineCommand({
  meta: {
    name: "rse",
    version: cliVersion,
    description: cliDomainDocs,
  },
  subCommands: {
    cli: () => import("./cli/cli-mod").then((r) => r.default),
    add: () => import("./cli/args/arg-add").then((r) => r.default),
    ai: () => import("./cli/args/arg-ai").then((r) => r.default),
    clone: () => import("./cli/args/arg-clone").then((r) => r.default),
    cmod: () => import("./cli/args/arg-cmod").then((r) => r.default),
    env: () => import("./cli/args/arg-env").then((r) => r.default),
    help: () => import("./cli/args/arg-help").then((r) => r.default),
    init: () => import("./cli/args/arg-init").then((r) => r.default),
    login: () => import("./cli/args/arg-login").then((r) => r.default),
    logout: () => import("./cli/args/arg-logout").then((r) => r.default),
    memory: () => import("./cli/args/arg-memory").then((r) => r.default),
    multireli: () =>
      import("./cli/args/arg-multireli").then((r) => r.default),
    schema: () => import("./cli/args/arg-schema").then((r) => r.default),
    studio: () => import("./cli/args/arg-studio").then((r) => r.default),
    update: () => import("./cli/args/arg-update").then((r) => r.default),
    upload: () => import("./cli/args/arg-upload").then((r) => r.default),
  },
});

if (import.meta.main) {
  await runMain(main).catch((error: unknown) => {
    errorHandler(
      error instanceof Error ? error : new Error(String(error)),
      "An unhandled error occurred, please report it at https://github.com/rse/rse",
    );
  });
} */
