import path from "@reliverse/pathkit";
import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand, multiselectPrompt, selectPrompt } from "@reliverse/rempts";
import { ensureReliverseConfig } from "~/app/config/prepare";
import { checkReliverseConfigHealth } from "~/app/rules/reliverse/dler-config-health/dler-config-health";
import { checkFileExtensions } from "~/app/rules/reliverse/file-extensions/file-extensions";
import { analyzeDependencies } from "~/app/rules/reliverse/missing-deps/analyzer";
import { checkMissingDependencies } from "~/app/rules/reliverse/missing-deps/deps-mod";
import type { FinderOptions } from "~/app/rules/reliverse/missing-deps/deps-types";
import { formatOutput } from "~/app/rules/reliverse/missing-deps/formatter";
import { checkNoDynamicImports } from "~/app/rules/reliverse/no-dynamic-imports/no-dynamic-imports";
import { checkNoIndexFiles } from "~/app/rules/reliverse/no-index-files/no-index-files";
import { checkPackageJsonHealth } from "~/app/rules/reliverse/package-json-health/package-json-health";
import { checkPathExtensions } from "~/app/rules/reliverse/path-extensions/path-extensions";
import { checkSelfInclude } from "~/app/rules/reliverse/self-include/self-include";
import { checkTsConfigHealth } from "~/app/rules/reliverse/tsconfig-health/tsconfig-health";
import type { AllowedFileExtensionsType } from "~/app/rules/rules-consts";
import { displayCheckResults } from "~/app/rules/rules-mod";
import type { DirectoryType } from "~/app/types/mod";

export default defineCommand({
  meta: {
    name: "check",
    version: "2.0.0",
    description:
      "Check your codebase for issues (deps, extensions, config, etc) or analyze dependencies.",
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },

    // --- check args ---
    directory: {
      type: "string",
      description:
        "directory to check (src, dist-npm, dist-jsr, dist-libs/npm, dist-libs/jsr, or all)",
    },
    checks: {
      type: "string",
      description:
        "comma-separated list of checks to run (missing-deps,file-extensions,path-extensions,dler-config-health,self-include,tsconfig-health,package-json-health,no-index-files)",
    },
    strict: {
      type: "boolean",
      description: "enable strict mode (requires explicit extensions)",
    },
    json: {
      type: "boolean",
      description: "output results in JSON format",
    },
    "no-exit": {
      type: "boolean",
      description: "don't exit with error code on issues (useful for pre-build checks)",
    },
    "no-progress": {
      type: "boolean",
      description: "don't show progress information (useful for pre-build checks)",
    },

    // --- deps args ---
    deps: {
      type: "boolean",
      description: "run dependency analysis instead of codebase checks",
    },
    all: {
      type: "boolean",
      description: "show all dependencies (both listed and not listed)",
    },
    ignore: {
      type: "string",
      description: "comma-separated patterns to ignore (for deps)",
    },
    builtins: {
      type: "boolean",
      description: "include Node.js built-in modules in the output (for deps)",
    },
    peer: {
      type: "boolean",
      description: "check peerDependencies instead of dependencies (for deps)",
    },
    optional: {
      type: "boolean",
      description: "check optionalDependencies instead of dependencies (for deps)",
    },
    fix: {
      type: "boolean",
      description: "automatically add missing dependencies to package.json (for deps)",
    },
    depth: {
      type: "number",
      description: "maximum directory depth to scan (0 for unlimited, for deps)",
      default: 0,
    },
  }),
  async run({ args }) {
    const isDev = args.dev;
    await ensureReliverseConfig(isDev, "ts");

    // --- If --deps is set, run dependency analysis and exit ---
    if (args.deps) {
      try {
        const directory = path.resolve(args.directory ?? ".");
        const ignorePatterns = args.ignore ? args.ignore.split(",") : [];

        const options: FinderOptions = {
          directory,
          showAll: args.all,
          ignorePatterns,
          json: args.json,
          builtins: args.builtins,
          dev: isDev,
          peer: args.peer,
          optional: args.optional,
          fix: args.fix,
          depth: args.depth,
        };

        console.log(re.gray(`Scanning directory: ${directory}`));

        const result = await analyzeDependencies(options);
        const output = formatOutput(result, options);

        console.log(output);

        if (result.missingDependencies.length > 0) {
          process.exit(1);
        }
      } catch (error) {
        console.error("Error:", error);
        process.exit(1);
      }
      return;
    }

    // --- Otherwise, run the original check logic ---
    relinka("info", "this command checks your codebase for extension and dependency issues.");
    relinka("info", "📁 file rules: .ts files allowed in src/jsr dirs, .js files in npm dirs");
    relinka("info", "📦 import rules: use .js imports in src/npm dirs, .ts imports in jsr dirs");
    relinka(
      "info",
      "🔄 self-include rules: no importing from main package or self-imports in libs",
    );
    relinka(
      "info",
      "📚 index files: avoid using index.{ts,js} files to prevent module resolution confusion",
    );

    let dir: string;
    let checks: string[];

    // Handle directory selection
    if (args.directory) {
      dir = args.directory;
    } else {
      dir = await selectPrompt({
        title: "select a directory to check",
        options: [
          { label: "all directories", value: "all" },
          { label: "src (typescript source)", value: "src" },
          { label: "dist-npm (compiled js)", value: "dist-npm" },
          { label: "dist-jsr (typescript)", value: "dist-jsr" },
          { label: "dist-libs/npm (compiled js)", value: "dist-libs/npm" },
          { label: "dist-libs/jsr (typescript)", value: "dist-libs/jsr" },
        ],
      });
    }

    // Handle checks selection
    if (args.checks) {
      checks = args.checks.split(",");
    } else {
      checks = await multiselectPrompt({
        title: "select checks to run",
        options: [
          { label: "missing dependencies", value: "missing-deps" },
          {
            label: "file extensions (.ts/.js files)",
            value: "file-extensions",
          },
          {
            label: "import path extensions (.ts/.js imports)",
            value: "path-extensions",
          },
          {
            label: "dler configuration",
            value: "dler-config-health",
          },
          {
            label: "self-include (no self-imports)",
            value: "self-include",
          },
          {
            label: "tsconfig.json validation",
            value: "tsconfig-health",
          },
          {
            label: "package.json validation",
            value: "package-json-health",
          },
          {
            label: "no index files",
            value: "no-index-files",
          },
          {
            label: "no dynamic imports",
            value: "no-dynamic-imports",
          },
        ],
      });
    }

    if (checks.length === 0) {
      relinka("warn", "no checks selected, exiting...");
      return;
    }

    // determine directories to check
    const directories =
      dir === "all"
        ? ([
            "src",
            "dist-npm",
            "dist-jsr",
            "dist-libs/npm",
            "dist-libs/jsr",
          ] as AllowedFileExtensionsType[])
        : [dir as AllowedFileExtensionsType];

    // run checks for each directory
    for (const directory of directories) {
      relinka("info", `\nchecking directory: ${directory}`);

      // progress callback for user feedback
      const onProgress = args["no-progress"]
        ? undefined
        : (current: number, total: number) => {
            if (current % 10 === 0 || current === total) {
              process.stdout.write(`\r  progress: ${current}/${total} files...`);
            }
          };

      try {
        if (checks.includes("package-json-health")) {
          const result = await checkPackageJsonHealth();
          displayCheckResults("package.json health", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("tsconfig-health")) {
          const result = await checkTsConfigHealth();
          displayCheckResults("tsconfig.json health", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("dler-config-health")) {
          const result = await checkReliverseConfigHealth();
          displayCheckResults("dler configuration health", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("file-extensions")) {
          const result = await checkFileExtensions({
            directory: directory as DirectoryType,
            strict: args.strict,
            moduleResolution: "bundler",
            onProgress,
          });
          displayCheckResults("file extensions", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("path-extensions")) {
          const result = await checkPathExtensions({
            directory: directory as DirectoryType,
            strict: args.strict,
            moduleResolution: "bundler",
            onProgress,
          });
          displayCheckResults("path extensions", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("self-include")) {
          const result = await checkSelfInclude({
            directory: directory as DirectoryType,
            strict: args.strict,
            moduleResolution: "bundler",
            onProgress,
          });
          displayCheckResults("self-include", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("no-index-files")) {
          const result = await checkNoIndexFiles({
            directory: directory as DirectoryType,
            strict: args.strict,
            moduleResolution: "bundler",
            onProgress,
          });
          displayCheckResults("no index files", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("no-dynamic-imports")) {
          const result = await checkNoDynamicImports({
            directory: directory as DirectoryType,
            onProgress,
          });
          displayCheckResults("no dynamic imports", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }

        if (checks.includes("missing-deps")) {
          const result = await checkMissingDependencies({
            directory: directory as DirectoryType,
            strict: args.strict,
            moduleResolution: "bundler",
            onProgress,
            json: args.json,
            builtins: args.builtins,
            dev: isDev,
            peer: args.peer,
            optional: args.optional,
            fix: args.fix,
            depth: args.depth,
          });
          displayCheckResults("missing dependencies", directory, result);
          if (!result.success && !args["no-exit"]) {
            process.exit(1);
          }
        }
      } catch (error) {
        relinka(
          "error",
          `failed to check ${directory}: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
    }

    relinka("success", "all checks completed!");
  },
});
