import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { defineArgs, defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import {
  convertFile,
  findEscapedFiles,
  findFiles,
  getOutputPath,
  getUnescapeOutputPath,
  parseMap,
  unconvertFile,
} from "@reliverse/rse-escaper";

export default defineCommand({
  meta: {
    name: "escape",
    description:
      "Convert files (.md, .mdc, .mdx, .json, .jsonc, .toml) to TypeScript with proper escaping",
    examples: [
      'escape --input "path/to/file.md"',
      'escape --input "path/to/dir"',
      'escape --input "path/to/dir" --map "md:.rules,path/to/file json:*.markdown"',
      'escape --input "path/to/dir-escaped" --unescape',
    ],
  },
  args: defineArgs({
    input: {
      type: "string",
      required: true,
      description: "Path to file or directory to process",
    },
    map: {
      type: "string",
      description:
        'Custom file mapping format: "md:.rules,path/to/file json:*.jsonc"',
    },
    recursive: {
      type: "boolean",
      description: "Process directories recursively (default: true)",
    },
    unescape: {
      type: "boolean",
      description:
        "Reverse the escape operation (convert .ts files back to original format)",
    },
  }),
  run: async ({ args }) => {
    const inputPath = resolve(args.input);

    if (!existsSync(inputPath)) {
      throw new Error(`Input path does not exist: ${inputPath}`);
    }

    const inputStat = statSync(inputPath);
    const isDirectory = inputStat.isDirectory();
    const recursive = args.recursive ?? true;

    if (args.unescape) {
      const files = await findEscapedFiles(inputPath, recursive);

      if (files.length === 0) {
        logger.warn("No escaped files found to process");
        return;
      }

      logger.info(`Processing ${files.length} file(s)...`);

      for (const file of files) {
        const outputPath = getUnescapeOutputPath(inputPath, file, isDirectory);
        await unconvertFile(file, outputPath);
        logger.info(`Unescaped: ${file} → ${outputPath}`);
      }

      logger.info("Unescape complete!");
    } else {
      const mappings = args.map ? parseMap(args.map) : null;

      const files = await findFiles(inputPath, mappings, recursive);

      if (files.length === 0) {
        logger.warn("No files found to process");
        return;
      }

      logger.info(`Processing ${files.length} file(s)...`);

      for (const file of files) {
        const outputPath = getOutputPath(inputPath, file, isDirectory);
        await convertFile(file, outputPath);
        logger.info(`Converted: ${file} → ${outputPath}`);
      }

      logger.info("Conversion complete!");
    }
  },
});
