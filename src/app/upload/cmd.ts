import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";
import fs from "node:fs/promises";
import ora from "ora";

import {
  readFilesFromPaths,
  uploadToProvider,
} from "~/libs/sdk/upload/providers/providers-mod";
import { formatBytes } from "~/libs/sdk/upload/upload-utils";

export default defineCommand({
  meta: {
    name: "upload",
    description: "Upload files to a cloud storage provider",
  },
  args: {
    files: {
      type: "positional",
      required: true,
      description: "List of files to upload",
    },
    provider: {
      type: "string",
      alias: "p",
      description: "Which provider to use (uploadthing|uploadcare)",
    },
    dryRun: {
      type: "boolean",
      description: "Simulate upload without actually sending files",
    },
  },
  run: async ({ args }) => {
    relinka("verbose", "args", String(args));

    const spinner = ora("Validating files...").start();

    try {
      // 1. Filter valid file paths
      const inputFiles = (
        Array.isArray(args.files) ? args.files : [args.files]
      ) as string[];
      const validFiles = await Promise.all(
        inputFiles.map(async (filePath: string) => {
          const exists = await fs
            .access(filePath)
            .then(() => true)
            .catch(() => false);
          if (!exists) relinka("error", `File not found: ${filePath}`);
          return exists ? filePath : null;
        }),
      ).then((results) =>
        results.filter((path): path is string => path !== null),
      );

      if (validFiles.length === 0) {
        spinner.fail("No valid files found!");
        return;
      }

      // 2. Handle dry run
      if (args.dryRun) {
        spinner.succeed("Dry run complete. No files uploaded.");
        return;
      }

      // 3. Read & upload
      spinner.text = "Uploading...";
      const fileObjs = await readFilesFromPaths(validFiles);
      const results = await uploadToProvider(fileObjs, args.provider);

      spinner.succeed("Upload completed!");
      relinka("info", "\nUpload Results:");
      results.forEach((res: any) => {
        relinka("info", `File: ${res.name}`);
        relinka("info", `URL: ${res.url}`);
        if (res.key) relinka("info", `Key: ${res.key}`);
        if (res.uuid) relinka("info", `UUID: ${res.uuid}`);
        relinka("info", `Size: ${formatBytes(res.size)}\n`);
      });
    } catch (error) {
      spinner.fail("Upload failed");
      relinka("error", String(error));
      process.exit(1);
    }
  },
});
