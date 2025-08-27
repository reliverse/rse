// [copy] simple example: `bun dler fs --mode copy --s "src/**/*.ts" --d "dist"`
// [copy] advanced example: `bun dler fs --mode copy --s ".temp/packages/*/lib/**/*" --d "src-ts/app/rules/external"`

import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand, inputPrompt, selectPrompt } from "@reliverse/rempts";
import pMap from "p-map";
import prettyMilliseconds from "pretty-ms";
import { glob } from "tinyglobby";
import { prepareCLIFiles, safeRename } from "~/app/utils/fs-rename";
import { createPerfTimer, getElapsedPerfTime } from "~/app/utils/utils-perf";

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path: string): Promise<void> {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
}

export default defineCommand({
  meta: {
    name: "rm",
    version: "1.1.0",
    description:
      "COPY or REMOVE or RENAME a file, directory, or glob pattern recursively. Usage example: `dler fs --mode rm --target '**/node_modules'`",
  },
  args: defineArgs({
    mode: {
      type: "string",
      description: "Mode to use: copy, rm, rename",
      allowed: ["copy", "rm", "rename"],
      required: true,
    },
    target: {
      type: "string",
      description:
        "Path or glob pattern to the file(s) or directory(ies) to complete the operation.",
      required: true,
      alias: "t",
    },
    nonInteractive: {
      type: "boolean",
      description:
        "Disable interactive prompts and require all arguments to be provided via flags.",
      default: false,
    },
    source: {
      type: "string",
      description: "Source file or directory to complete the operation (supports glob patterns)",
      alias: "s",
    },
    destination: {
      type: "string",
      description: "Destination path for the operation",
      alias: "d",
    },
    recursive: {
      type: "boolean",
      description: "Recursively process all files in subdirectories (default: true)",
      default: true,
    },
    preserveStructure: {
      type: "boolean",
      description: "Preserve source directory structure in destination (default: true)",
      default: true,
    },
    increment: {
      type: "boolean",
      description:
        "Attach an incrementing index to each destination filename before the extension if set (default: true)",
      default: true,
    },
    concurrency: {
      type: "number",
      description: "Number of concurrent copy operations (default: 8)",
      default: 8,
    },
    gitignore: {
      type: "boolean",
      description: "Ignore files and directories specified in .gitignore",
      default: false,
    },
    prepareMyCLI: {
      type: "boolean",
      description: "Prepare CLI by renaming files",
    },
    revert: {
      type: "boolean",
      description: "Revert renamed files back to original names",
    },
    useDtsTxtForPrepareMyCLI: {
      type: "boolean",
      description: "Use .d.ts.txt extension for .d.ts files in prepareMyCLI mode (default: false)",
    },
  }),
  async run({ args }) {
    const {
      mode,
      nonInteractive,
      source,
      destination,
      recursive = true,
      preserveStructure = true,
      increment = false,
      concurrency = 8,
      gitignore = false,
      prepareMyCLI,
      revert,
      useDtsTxtForPrepareMyCLI = false,
    } = args;
    let { target } = args;

    if (mode === "rm") {
      if (!target && !nonInteractive) {
        target = await inputPrompt({
          title: "Enter the path or glob pattern to remove:",
          defaultValue: "",
        });
      }

      if (!target) {
        relinka("error", "No target path or pattern provided for removal.");
        return;
      }

      let matches: string[] = [];
      try {
        matches = await glob(target, { dot: true });
      } catch (error) {
        relinka("error", `Invalid glob pattern: ${target}`);
        return;
      }

      if (matches.length === 0) {
        relinka("error", `No files or directories matched: ${target}`);
        return;
      }

      // Sort matches so that deeper paths (files/dirs) are removed before their parent directories
      matches.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

      let removedCount = 0;
      const concurrency = 8;
      await pMap(
        matches,
        async (match) => {
          const resolvedPath = path.resolve(match);
          try {
            if (!(await fs.pathExists(resolvedPath))) {
              relinka("warn", `Target does not exist: ${resolvedPath}`);
              return;
            }
            await fs.remove(resolvedPath);
            relinka("verbose", `Removed: ${resolvedPath}`);
            removedCount++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            relinka("error", `Failed to remove '${resolvedPath}': ${errorMessage}`);
          }
        },
        { concurrency },
      );

      if (removedCount > 0) {
        relinka("verbose", `Successfully removed ${removedCount} item(s) matching: ${target}`);
      } else {
        relinka("warn", `No items were removed for pattern: ${target}`);
      }
    } else if (mode === "copy") {
      let finalSource = source;
      let finalDestination = destination;

      if (!finalSource) {
        finalSource = await inputPrompt({
          title: "Enter source file or directory (supports glob patterns)",
          placeholder: "e.g., putout/packages/*/lib/**/*",
        });
      }

      if (!finalDestination) {
        finalDestination = await inputPrompt({
          title: "Enter destination path",
          placeholder: "e.g., src-ts/app/rules/putout",
        });
      }

      if (!finalSource || !finalDestination) {
        relinka("error", "Usage: dler copy --s <source> --d <destination>");
        process.exit(1);
      }

      let ignorePatterns: string[] = recursive ? [] : ["**/*"];
      if (gitignore) {
        try {
          const gitignoreContent = await fs.readFile(".gitignore", "utf8");
          ignorePatterns = ignorePatterns.concat(
            gitignoreContent
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line && !line.startsWith("#")),
          );
        } catch (err) {
          relinka("error", ".gitignore not found or unreadable, but --gitignore was specified.");
          process.exit(1);
        }
      }

      try {
        const files = await glob(finalSource, {
          dot: true,
          ignore: ignorePatterns,
        });

        if (files.length === 0) {
          relinka("error", `No files found matching pattern: ${finalSource}`);
          process.exit(1);
        }

        if (files.length > 1) {
          const confirm = await selectPrompt({
            title: `Found ${files.length} files to copy. Proceed?`,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          });

          if (confirm === "no") {
            relinka("verbose", "Operation cancelled by user");
            return;
          }
        }

        const timer = createPerfTimer();

        // Track file name counts per directory for increment logic
        const fileNameCounts = new Map<string, Map<string, number>>();

        await pMap(
          files,
          async (file) => {
            let destPath: string;
            if (preserveStructure) {
              const match = file.match(/packages\/([^/]+)\/lib\/(.*)/);
              if (match?.[1] && match?.[2]) {
                const packageName = match[1];
                const relativePath = match[2];
                destPath = path.join(finalDestination, packageName, relativePath);
              } else {
                destPath = path.join(finalDestination, file);
              }
            } else {
              destPath = path.join(finalDestination, path.basename(file));
            }

            if (increment) {
              const dir = path.dirname(destPath);
              const base: string = path.basename(destPath);
              let dirMap = fileNameCounts.get(dir);
              if (!dirMap) {
                dirMap = new Map();
                fileNameCounts.set(dir, dirMap);
              }
              const count = dirMap.get(base) || 0;
              if (count > 0) {
                const extMatch = base.match(/(.*)(\.[^./\\]+)$/);
                let newBase: string;
                if (extMatch) {
                  newBase = `${extMatch[1]}-${count + 1}${extMatch[2]}`;
                } else {
                  newBase = `${base}-${count + 1}`;
                }
                destPath = path.join(dir, newBase);
              }
              dirMap.set(base, count + 1);
            }

            await ensureDir(path.dirname(destPath));

            if (await fileExists(destPath)) {
              throw new Error(`Destination file already exists: ${destPath}`);
            }

            await fs.copyFile(file, destPath);
            relinka("verbose", `Copied '${file}' to '${destPath}'`);
          },
          { concurrency, stopOnError: true },
        );

        const elapsed = getElapsedPerfTime(timer);
        relinka(
          "log",
          `Successfully copied ${files.length} file(s) in ${prettyMilliseconds(elapsed)}`,
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        relinka("error", `Error during copy operation: ${errorMessage}`);
        process.exit(1);
      }
    } else if (mode === "rename") {
      if (prepareMyCLI === true) {
        try {
          await prepareCLIFiles(revert === true, recursive, useDtsTxtForPrepareMyCLI);
          relinka("verbose", "Successfully prepared CLI files");
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          relinka("error", `Error preparing CLI: ${errorMessage}`);
          process.exit(1);
        }
        return;
      }

      if (!source || !destination) {
        relinka(
          "error",
          "Usage: dler fs --mode rename --source <source> --destination <destination>",
        );
        process.exit(1);
      }

      try {
        await safeRename(source, destination);
        relinka("verbose", `Successfully renamed '${source}' to '${destination}'`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        relinka("error", `Error renaming: ${errorMessage}`);
        process.exit(1);
      }
    }
  },
});
