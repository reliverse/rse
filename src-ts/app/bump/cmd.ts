// usage example: bun rse bump

import path from "node:path";
import {
  type BumpMode,
  bumpVersionWithAnalysis,
  getConfigFromDler,
  getCurrentVersion,
  getDefaultBumpMode,
  getFilesFromConfigOrDefault,
  handleInteractiveSession,
  handleNonInteractiveSession,
  type SessionConfig,
  validateBumpConfig,
} from "@reliverse/bleump";
import { relinka } from "@reliverse/relinka";
import {
  defineArgs,
  defineCommand,
  endPrompt,
  inputPrompt,
  runMain,
  selectPrompt,
  startPrompt,
} from "@reliverse/rempts";
import { readPackage } from "pkg-types";
import semver from "semver";

const bumpTypes: BumpMode[] = ["patch", "minor", "major", "auto", "manual"];

const main = defineCommand({
  meta: {
    name: "bleump",
    description: "Allows you to bump the version of your project interactively.",
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },
    bumpType: {
      type: "string",
      description: "The type of version bump to perform",
      allowed: bumpTypes,
    },
    customVersion: {
      type: "string",
      description: "Custom version to set (only used with manual bump type)",
    },
    disableBump: {
      type: "boolean",
      description: "Disables the bump (this is useful for CI)",
    },
    files: {
      type: "string",
      description:
        'Files to bump (comma or space-separated, or quoted: "package.json reliverse.ts")',
      default: "",
    },
    dryRun: {
      type: "boolean",
      description: "Preview changes without writing files",
    },
    mainFile: {
      type: "string",
      description: "The file to use as version source (defaults to package.json)",
      default: "package.json",
    },
    verbose: {
      type: "boolean",
      description: "Enable verbose output",
    },
  }),
  async run({ args }) {
    const isCI = process.env.CI === "true";
    const isNonInteractive = !process.stdout.isTTY;
    const dryRun = !!args.dryRun;
    const verbose = !!args.verbose;
    const mainFile = args.mainFile as string;
    const customVersion = args.customVersion as string | undefined;

    // Read current versions
    let bleumpVersion = "unknown";
    let projectVersion = "unknown";
    try {
      const bleumpPkg = await readPackage();
      bleumpVersion = bleumpPkg.version || "unknown";
      projectVersion = await getCurrentVersion(mainFile);
    } catch (e) {
      relinka("warn", `Could not read package versions: ${e}`);
    }

    await showStartPrompt(args.dev as boolean, bleumpVersion);

    // Get files to bump - handle multiple parsing scenarios
    let filesToBumpArr: string[] = [];

    // Handle files from --files flag with improved parsing
    if (args.files) {
      // handle both comma and space separation, plus remaining CLI args
      const filesFromFlag = (args.files as string)
        .split(/[,\s]+/) // split on comma or whitespace
        .map((f) => f.trim())
        .filter(Boolean);

      // also check if there are additional file arguments after known flags
      const remainingArgs = process.argv.slice(2);
      const knownFlags = [
        "--dev",
        "--bumpType",
        "--customVersion",
        "--disableBump",
        "--files",
        "--dryRun",
        "--mainFile",
        "--verbose",
      ];

      // find files that appear after --files but aren't flags
      const filesIndex = remainingArgs.indexOf("--files");
      if (filesIndex !== -1) {
        for (let i = filesIndex + 2; i < remainingArgs.length; i++) {
          const arg = remainingArgs[i];
          if (!arg || arg.startsWith("--") || knownFlags.includes(arg)) break;
          if (!filesFromFlag.includes(arg)) {
            filesFromFlag.push(arg);
          }
        }
      }

      filesToBumpArr = filesFromFlag;
    }

    // If no files specified, use defaults
    if (filesToBumpArr.length === 0) {
      filesToBumpArr = await getFilesFromConfigOrDefault();
    }

    // Ensure mainFile is in the list (using absolute path)
    if (!filesToBumpArr.includes(mainFile)) {
      filesToBumpArr.unshift(mainFile);
    }

    // Remove duplicates while preserving order
    filesToBumpArr = [...new Set(filesToBumpArr)];

    // Get bump type and other settings from config
    const dlerConfig = await getConfigFromDler();
    let effectiveBumpMode = args.bumpType as BumpMode;

    // Apply config settings if not overridden by CLI args
    if (!effectiveBumpMode && dlerConfig.bumpMode) {
      effectiveBumpMode = dlerConfig.bumpMode;
    }
    if (!effectiveBumpMode) {
      effectiveBumpMode = getDefaultBumpMode(isCI, isNonInteractive);
    }

    // Override disableBump from config if not set via CLI
    if (!args.disableBump && dlerConfig.bumpDisable) {
      args.disableBump = true as never;
    }

    const sessionConfig: SessionConfig = {
      isCI,
      isNonInteractive,
      mainFile,
      filesToBump: filesToBumpArr,
      options: { dryRun, verbose, customVersion },
      bumpType: effectiveBumpMode,
    };

    if (verbose) {
      relinka("info", "Configuration:");
      relinka("log", `  Bump Type: ${effectiveBumpMode}`);
      relinka("log", `  Custom Version: ${customVersion || "none"}`);
      relinka("log", `  Dry Run: ${dryRun}`);
      relinka("log", `  Main File: ${mainFile}`);
      relinka("log", `  Files to Bump (${filesToBumpArr.length}):`);
      for (const file of filesToBumpArr) {
        relinka("log", `    ${file}`);
      }
      relinka("log", `  Current Version: ${projectVersion}`);
    }

    if (args.disableBump) {
      relinka("log", "Bump disabled (--disableBump flag set or configured in dler.ts)");
      process.exit(0);
    }

    try {
      if (isCI || isNonInteractive) {
        await handleNonInteractiveSession(sessionConfig);
      } else {
        await handleInteractiveSession(sessionConfig, projectVersion);

        // Get bump type from user if not provided
        if (!args.bumpType) {
          effectiveBumpMode = (await selectPrompt({
            title: `Select a bump type (current: ${projectVersion} from ${path.relative(process.cwd(), mainFile)})`,
            options: [
              {
                value: "patch",
                label: `patch (${projectVersion} → ${semver.inc(projectVersion, "patch")})`,
              },
              {
                value: "minor",
                label: `minor (${projectVersion} → ${semver.inc(projectVersion, "minor")})`,
              },
              {
                value: "major",
                label: `major (${projectVersion} → ${semver.inc(projectVersion, "major")})`,
              },
              {
                value: "auto",
                label: "auto (automatically determine bump type)",
              },
              {
                value: "manual",
                label: "manual (enter your own version)",
              },
            ],
          })) as BumpMode;

          // If manual selected, prompt for the version
          if (effectiveBumpMode === "manual") {
            const newCustomVersion = await inputPrompt({
              title: "Enter the version number",
              content: "Must be a valid semver (e.g., 1.2.3)",
              defaultValue: projectVersion,
              validate: (input: string) => {
                if (!semver.valid(input)) {
                  return "Please enter a valid semver version (e.g., 1.2.3)";
                }
                return true;
              },
            });
            sessionConfig.options.customVersion = newCustomVersion;
          }
        }

        sessionConfig.bumpType = effectiveBumpMode;
        validateBumpConfig(effectiveBumpMode, sessionConfig.options.customVersion);
        await bumpVersionWithAnalysis(
          effectiveBumpMode,
          filesToBumpArr,
          sessionConfig.options,
          dlerConfig.bumpSet,
        );
      }
    } catch (error) {
      relinka("error", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    relinka("log", " ");
    await showEndPrompt();
  },
});

await runMain(main);

async function showStartPrompt(isDev: boolean, currentVersion: string) {
  await startPrompt({
    titleColor: "inverse",
    clearConsole: false,
    packageName: "bleump",
    packageVersion: currentVersion,
    isDev,
  });
}

async function showEndPrompt() {
  await endPrompt({
    title:
      "❤️  Please support bleump: https://github.com/sponsors/blefnk\n│  📝  Feedback: https://github.com/blefnk/bleump/issues",
    titleColor: "dim",
  });
}
