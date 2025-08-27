/**
 * USAGE EXAMPLES:
 * - dler create react-app - creates a project from template (like bun create, pnpm create)
 * - dler create --mode files - creates files from templates
 * - dler create --mode files --fileType md:README - creates specific file type
 * - dler create --mode files --multiple - creates multiple file types
 */

import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand, multiselectPrompt, selectPrompt } from "@reliverse/rempts";
import { x } from "~/app/utils/exec/exec-mod";
import { FILE_TYPES } from "~/app/utils/init/init-const";
import { initFile, initFiles } from "~/app/utils/init/init-impl";
import type { FileType, InitFileRequest } from "~/app/utils/init/init-types";
import { detectPackageManager } from "~/app/utils/pm/pm-detect";

export default defineCommand({
  meta: {
    name: "create",
    version: "1.1.0",
    description:
      "Create projects from templates or create files. Usage example: `dler create react-app` or `dler create --mode files`",
  },
  args: defineArgs({
    template: {
      type: "positional",
      description: "Template name for project creation (e.g., react-app, next-app)",
      required: false,
    },
    mode: {
      type: "string",
      description: "Mode to use: template (default), files",
      allowed: ["template", "files"],
      default: "template",
    },
    fileType: {
      type: "string",
      description: "File type to create (e.g. 'md:README') - only for files mode",
    },
    destDir: {
      type: "string",
      description: "Destination directory",
      default: ".",
    },
    multiple: {
      type: "boolean",
      description: "Whether to select multiple file types from the library - only for files mode",
    },
    parallel: {
      type: "boolean",
      description: "Run tasks in parallel - only for files mode",
    },
    concurrency: {
      type: "string",
      description: "Concurrency limit if parallel is true - only for files mode",
      default: "4",
    },
    cwd: {
      type: "string",
      description: "Current working directory",
    },
  }),
  async run({ args }) {
    // console.log("DEBUG: create command starting with args:", args);

    const { template, mode, fileType, destDir, multiple, parallel, concurrency, cwd } = args;

    if (mode === "files") {
      // File creation mode - similar to old init functionality
      await handleFileCreation({ fileType, destDir, multiple, parallel, concurrency });
    } else {
      // Template creation mode - similar to bun create, pnpm create, etc.
      await handleTemplateCreation({ template, destDir, cwd });
    }
  },
});

async function handleFileCreation({
  fileType,
  destDir,
  multiple,
  parallel,
  concurrency,
}: {
  fileType?: string;
  destDir: string;
  multiple?: boolean;
  parallel?: boolean;
  concurrency: string;
}) {
  const concurrencyNum = Number(concurrency);

  // throw error if fileType doesn't include FILE_TYPES.type
  if (fileType && !FILE_TYPES.find((ft) => ft.type === fileType)) {
    throw new Error(`Invalid file type: ${fileType}`);
  }

  const effectiveFileType: FileType = fileType as FileType;

  if (multiple) {
    // Let the user choose multiple file types from a prompt
    const possibleTypes = FILE_TYPES.map((ft) => ft.type);
    const chosen = await multiselectPrompt({
      title: "Select file types to create",
      options: possibleTypes.map((pt) => ({ label: pt, value: pt })),
    });

    if (chosen.length === 0) {
      relinka("verbose", "No file types selected. Exiting...");
      return;
    }

    // Construct an array of requests
    const requests: InitFileRequest[] = chosen.map((ct) => ({
      fileType: ct,
      destDir,
    }));

    const results = await initFiles(requests, {
      parallel,
      concurrency: concurrencyNum,
    });
    relinka("verbose", `Multiple files result: ${JSON.stringify(results)}`);
  } else {
    // Single file approach
    let finalFileType = effectiveFileType;
    if (!finalFileType) {
      // If user didn't specify, prompt for a single file type
      const possibleTypes = FILE_TYPES.map((ft) => ft.type);
      const picked = await selectPrompt({
        title: "Pick a file type to create",
        options: possibleTypes.map((pt) => ({ label: pt, value: pt })),
      });
      finalFileType = picked;
    }

    const result = await initFile({
      fileType: finalFileType,
      destDir,
    });
    relinka("verbose", `Single file result: ${JSON.stringify(result)}`);
  }
}

async function handleTemplateCreation({
  template,
  destDir,
  cwd,
}: {
  template?: string;
  destDir: string;
  cwd?: string;
}) {
  if (!template) {
    relinka.error("Template name is required for template creation");
    relinka.verbose("Usage: dler create <template-name>");
    relinka.verbose("Example: dler create react-app");
    return process.exit(1);
  }

  try {
    // Detect the package manager to use the appropriate create command
    const workingDir: string = cwd || process.cwd();
    const packageManager = await detectPackageManager(workingDir);

    if (!packageManager) {
      relinka.error("Cannot detect package manager. Defaulting to bun create.");
    }

    const pmName = packageManager?.name || "bun";
    let createCommand: string[];

    switch (pmName) {
      case "bun":
        createCommand = ["bun", "create", template];
        break;
      case "pnpm":
        createCommand = ["pnpm", "create", template];
        break;
      case "yarn":
        createCommand = ["yarn", "create", template];
        break;
      case "npm":
        createCommand = ["npm", "create", template];
        break;
      default:
        createCommand = ["bun", "create", template];
        break;
    }

    if (destDir !== ".") {
      createCommand.push(destDir);
    }

    relinka.verbose(`Creating project from template: ${template}`);
    relinka.verbose(`Using command: ${createCommand.join(" ")}`);

    // Execute the create command
    const result = x(createCommand[0]!, createCommand.slice(1), {
      nodeOptions: {
        cwd: workingDir,
        stdio: "inherit",
      },
      throwOnError: true,
    });

    // Wait for the command to complete
    const output = await result;

    if (output.exitCode === 0) {
      relinka.success(`Successfully created project from template: ${template}`);
    } else {
      relinka.error(`Failed to create project. Exit code: ${output.exitCode}`);
      return process.exit(output.exitCode || 1);
    }
  } catch (error) {
    relinka.error(
      `Failed to create project from template: ${error instanceof Error ? error.message : String(error)}`,
    );
    return process.exit(1);
  }
}
