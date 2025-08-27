import {
  commonEndActions,
  commonStartActions,
  createPerfTimer,
  dlerBuild,
  finalizeBuild,
  getConfigDler,
  getCurrentWorkingDirectory,
} from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { type CmdName, msgs } from "~/const";

export default defineCommand({
  meta: {
    name: "build" as CmdName,
    description: msgs.cmds.build,
  },
  args: defineArgs({
    // Common args
    ci: {
      type: "boolean",
      description: msgs.args.ci,
      default: !process.stdout.isTTY || !!process.env["CI"],
    },
    dev: {
      type: "boolean",
      description: msgs.args.dev,
    },
    cwd: {
      type: "string",
      description: msgs.args.cwd,
      default: getCurrentWorkingDirectory(),
    },
    // Command specific args
    debugOnlyCopyNonBuildFiles: {
      type: "boolean",
      description: "Only copy non-build files to dist directories",
    },
    debugDontCopyNonBuildFiles: {
      type: "boolean",
      description:
        "Don't copy non-build files to dist directories, only build buildPreExtensions files",
    },
    "binary-enabled": {
      type: "boolean",
      description: "Enable binary build functionality to create standalone executables",
    },
    "binary-input": {
      type: "string",
      description: "Input TypeScript file to bundle for binary builds (overrides config)",
    },
    "binary-targets": {
      type: "string",
      description:
        "Comma-separated list of targets to build for (use 'all' for all targets, 'list' to show available targets)",
    },
    "binary-outdir": {
      type: "string",
      description: "Output directory for built binary executables (overrides config)",
    },
    "binary-minify": {
      type: "boolean",
      description: "Minify the binary output (overrides config)",
    },
    "binary-sourcemap": {
      type: "boolean",
      description: "Generate source maps for binary builds (overrides config)",
    },
    "binary-bytecode": {
      type: "boolean",
      description:
        "Enable bytecode compilation for faster startup (Bun v1.1.30+) (overrides config)",
    },
    "binary-clean": {
      type: "boolean",
      description: "Clean output directory before building binaries (overrides config)",
    },
    "binary-windows-icon": {
      type: "string",
      description: "Path to Windows .ico file for executable icon (overrides config)",
    },
    "binary-windows-hide-console": {
      type: "boolean",
      description: "Hide console window on Windows (overrides config)",
    },
    "binary-asset-naming": {
      type: "string",
      description: "Asset naming pattern for binary builds (overrides config)",
    },
    "binary-parallel": {
      type: "boolean",
      description: "Build binary targets in parallel (overrides config)",
    },
    "binary-external": {
      type: "array",
      description: "External dependencies to exclude from binary bundle (overrides config)",
    },
    "binary-no-compile": {
      type: "boolean",
      description: "Create a bundled script instead of standalone executable (overrides config)",
    },
  }),
  run: async ({ args }) => {
    const {
      ci,
      cwd,
      dev,
      debugOnlyCopyNonBuildFiles,
      debugDontCopyNonBuildFiles,
      "binary-enabled": binaryEnabled,
      "binary-input": binaryInput,
      "binary-targets": binaryTargets,
      "binary-outdir": binaryOutdir,
      "binary-minify": binaryMinify,
      "binary-sourcemap": binarySourcemap,
      "binary-bytecode": binaryBytecode,
      "binary-clean": binaryClean,
      "binary-windows-icon": binaryWindowsIcon,
      "binary-windows-hide-console": binaryWindowsHideConsole,
      "binary-asset-naming": binaryAssetNaming,
      "binary-parallel": binaryParallel,
      "binary-external": binaryExternal,
      "binary-no-compile": binaryNoCompile,
    } = args;

    const isCI = Boolean(ci);
    const isDev = Boolean(dev);
    const strCwd = String(cwd);
    const isDebugOnlyCopyNonBuildFiles = Boolean(debugOnlyCopyNonBuildFiles);
    const isDebugDontCopyNonBuildFiles = Boolean(debugDontCopyNonBuildFiles);

    await commonStartActions({
      isCI,
      isDev,
      strCwd,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: true,
    });

    const timer = createPerfTimer();
    const config = await getConfigDler();

    // Override binary build config with command line args if provided
    // @see https://bun.com/docs/bundler/executables
    if (binaryEnabled !== undefined) {
      config.binaryBuildEnabled = Boolean(binaryEnabled);
    }
    if (binaryInput !== undefined) {
      config.binaryBuildInputFile = String(binaryInput);
    }
    if (binaryTargets !== undefined) {
      config.binaryBuildTargets = String(binaryTargets);
    }
    if (binaryOutdir !== undefined) {
      config.binaryBuildOutDir = String(binaryOutdir);
    }
    if (binaryMinify !== undefined) {
      config.binaryBuildMinify = Boolean(binaryMinify);
    }
    if (binarySourcemap !== undefined) {
      config.binaryBuildSourcemap = Boolean(binarySourcemap);
    }
    if (binaryBytecode !== undefined) {
      config.binaryBuildBytecode = Boolean(binaryBytecode);
    }
    if (binaryClean !== undefined) {
      config.binaryBuildClean = Boolean(binaryClean);
    }
    if (binaryWindowsIcon !== undefined) {
      config.binaryBuildWindowsIcon = String(binaryWindowsIcon);
    }
    if (binaryWindowsHideConsole !== undefined) {
      config.binaryBuildWindowsHideConsole = Boolean(binaryWindowsHideConsole);
    }
    if (binaryAssetNaming !== undefined) {
      config.binaryBuildAssetNaming = String(binaryAssetNaming);
    }
    if (binaryParallel !== undefined) {
      config.binaryBuildParallel = Boolean(binaryParallel);
    }
    if (binaryExternal !== undefined) {
      config.binaryBuildExternal = binaryExternal as string[];
    }
    if (binaryNoCompile !== undefined) {
      config.binaryBuildNoCompile = Boolean(binaryNoCompile);
    }

    await dlerBuild(
      timer,
      isDev,
      config,
      isDebugOnlyCopyNonBuildFiles,
      isDebugDontCopyNonBuildFiles,
    );
    await finalizeBuild(timer, false, "build");

    await commonEndActions({ withEndPrompt: true });
  },
});
