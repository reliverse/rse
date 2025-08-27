import {
  commonEndActions,
  commonStartActions,
  getCurrentWorkingDirectory,
  useAggregator,
} from "@reliverse/dler";
import path from "@reliverse/pathkit";
import { defineArgs, defineCommand, inputPrompt } from "@reliverse/rempts";
import type { CmdName } from "~/const";
import { msgs } from "~/const";

export default defineCommand({
  meta: {
    name: "agg" as CmdName,
    description: msgs.cmds.agg,
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
    imports: {
      description: "If true, produce import lines instead of export lines",
      type: "boolean",
    },
    input: {
      description: "Directory containing .ts/.js files (--input <directory>)",
      type: "string",
    },
    named: {
      description: "Parse each file for named exports (function/class/const/let)",
      type: "boolean",
      default: true,
    },
    out: {
      description: "Output aggregator file path (--out <fileName>)",
      type: "string",
    },
    recursive: {
      description:
        "Recursively scan subdirectories (default true) (false means only scan the files in the current directory and not subdirectories)",
      type: "boolean",
      default: true,
    },
    strip: {
      description: "Remove specified path prefix from final imports/exports",
      type: "string",
    },
    sort: {
      description: "Sort aggregated lines alphabetically",
      type: "boolean",
    },
    header: {
      description: "Add a header comment to the aggregator output",
      type: "string",
    },
    verbose: {
      description: "Enable verbose logging",
      type: "boolean",
    },
    includeInternal: {
      description: "Include files marked as internal (starting with #)",
      type: "boolean",
    },
    internalMarker: {
      description: "Marker for internal files (default: #)",
      type: "string",
      default: "#",
    },
    override: {
      description: "Override entire file instead of updating only the aggregator block",
      type: "boolean",
    },
    extensions: {
      description:
        "Comma-separated list of file extensions to process (default: .ts,.js,.mts,.cts,.mjs,.cjs)",
      type: "string",
      default: ".ts,.js,.mts,.cts,.mjs,.cjs",
    },
    separateTypesFile: {
      description: "Create a separate file for type exports",
      type: "boolean",
    },
    typesOut: {
      description: "Output file path for types (used when separateTypesFile is true)",
      type: "string",
    },
    nonInteractive: {
      description: "Disable interactive prompts and require all arguments to be provided via flags",
      type: "boolean",
      default: false,
    },
  }),
  run: async ({ args }) => {
    const {
      // Common args
      ci,
      dev,
      cwd,
      // Command specific args
      imports,
      input,
      named,
      out,
      recursive,
      strip,
      sort,
      header,
      verbose,
      includeInternal,
      internalMarker,
      override,
      extensions,
      separateTypesFile,
      typesOut,
      nonInteractive,
    } = args;

    // Common args
    const isCI = Boolean(ci);
    const isDev = Boolean(dev);
    const strCwd = String(cwd);

    // Command specific args
    const hasInput = Boolean(input);
    const hasOutput = Boolean(out);
    const isRecursive = Boolean(recursive);
    const shouldSort = Boolean(sort);
    const isVerbose = Boolean(verbose);
    const includeInternalFiles = Boolean(includeInternal);
    const useImports = Boolean(imports);
    const useNamedExports = Boolean(named);
    const overrideEntireFile = Boolean(override);
    const createSeparateTypesFile = Boolean(separateTypesFile);
    const typesOutputPath = String(typesOut);
    const disableInteractivePrompts = Boolean(nonInteractive);

    // Start actions
    await commonStartActions({
      isCI,
      isDev,
      strCwd,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: true,
    });

    // Redefine args by using mutable variables for interactive prompts
    let resolvedInput = String(input || "");
    let resolvedOutput = String(out || "");
    let resolvedTypesOutput = String(typesOut || "");
    const resolvedStripPrefix = String(strip || "");
    const resolvedHeader = String(header || "");
    const resolvedInternalMarker = String(internalMarker || "#");
    const resolvedExtensions = String(extensions || ".ts,.js,.mts,.cts,.mjs,.cjs");

    // Handle required arguments with prompts when nonInteractive is false
    if (!disableInteractivePrompts) {
      if (!hasInput) {
        const promptInput = await inputPrompt({
          title: "Enter input directory containing .ts/.js files:",
          defaultValue: "",
        });
        resolvedInput = promptInput;
      }

      if (!hasOutput) {
        const promptOutput = await inputPrompt({
          title: "Enter output aggregator file path:",
          defaultValue: "",
        });
        resolvedOutput = promptOutput;
      }

      if (createSeparateTypesFile && !typesOutputPath) {
        const promptTypesOutput = await inputPrompt({
          title: "Enter output file path for types:",
          defaultValue: String(resolvedOutput).replace(/\.(ts|js)$/, ".types.$1"),
        });
        resolvedTypesOutput = promptTypesOutput;
      }
    } else {
      // Validate required arguments in non-interactive mode
      if (!hasInput) {
        throw new Error("Missing required argument: --input");
      }
      if (!hasOutput) {
        throw new Error("Missing required argument: --out");
      }
      if (createSeparateTypesFile && !typesOutputPath) {
        throw new Error(
          "Missing required argument: --typesOut (required when --separateTypesFile is true)",
        );
      }
    }

    await useAggregator({
      inputDir: path.resolve(resolvedInput),
      isRecursive,
      outFile: path.resolve(resolvedOutput),
      stripPrefix: resolvedStripPrefix ? path.resolve(resolvedStripPrefix) : "",
      useImport: useImports,
      useNamed: useNamedExports,
      sortLines: shouldSort,
      headerComment: resolvedHeader,
      verbose: isVerbose,
      includeInternal: includeInternalFiles,
      typesOutFile: path.resolve(resolvedTypesOutput),
      internalMarker: resolvedInternalMarker,
      overrideFile: overrideEntireFile,
      ignoreDirs: [],
      fileExtensions: resolvedExtensions.split(",").map((ext: string) => ext.trim()),
      separateTypesFile: createSeparateTypesFile,
    });

    await commonEndActions({ withEndPrompt: true });
  },
});
