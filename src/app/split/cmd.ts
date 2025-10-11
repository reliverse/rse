/**
 * Splits large source files into smaller ones and large functions into smaller helper functions.
 *
 * This addon:
 * 1) Reads all *.ts or *.js files from a directory.
 * 2) Splits files larger than a specified line threshold.
 * 3) Splits functions larger than a specified line threshold into smaller helpers.
 *
 * Usage:
 *   bun dev split --dir ./example --file-threshold 30 --func-threshold 20
 *
 * Warning: This addon is experimental and might break code. A more stable version will be available in the future.
 */

import { getAllSourceFiles, splitLargeFileByLines, splitLargeFunctions } from "@reliverse/dler";
import fs from "@reliverse/relifso";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  args: defineArgs({
    directory: {
      type: "string",
      description: "The directory to split",
      required: true,
    },
    fileLineThreshold: {
      type: "number",
      description: "The line threshold for splitting files",
      required: true,
    },
    funcLineThreshold: {
      type: "number",
      description: "The line threshold for splitting functions",
      required: true,
    },
  }),
  async run({ args }) {
    const { directory, fileLineThreshold, funcLineThreshold } = args;
    const allFiles = getAllSourceFiles(directory);

    for (const filePath of allFiles) {
      // 1) Split entire file if it’s too large:
      const lineCount = fs.readFileSync(filePath, "utf8").split("\n").length;
      if (lineCount > fileLineThreshold) {
        // This returns an array of newly created file paths
        const newSplits = splitLargeFileByLines(filePath, fileLineThreshold);
        // Run "splitLargeFunctions" on each chunk
        newSplits.forEach((splitFilePath) => {
          splitLargeFunctions(splitFilePath, funcLineThreshold);
        });
      } else {
        // 2) Split large functions in the original file
        splitLargeFunctions(filePath, funcLineThreshold);
      }
    }
  },
});
