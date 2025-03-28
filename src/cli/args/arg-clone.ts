import {
  defineCommand,
  relinka,
  confirmPrompt,
  selectPrompt,
  inputPrompt,
} from "@reliverse/prompts";
import fs from "fs-extra";
import path from "pathe";

import { handleDownload } from "~/libs/sdk/utils/downloading/handleDownload.js";

export default defineCommand({
  meta: {
    name: "get",
    description: "Download a repository using the Reliverse downloader",
  },
  args: {
    repo: {
      type: "string",
      description: "Repository identifier (e.g., owner/repo)",
      required: false,
    },
    dest: {
      type: "string",
      description: "Destination directory for the downloaded repository",
      required: false,
    },
    dev: {
      type: "boolean",
      description:
        "Run in development mode (places project in tests-runtime folder)",
      default: false,
    },
    force: {
      type: "boolean",
      description: "Force overwrite if destination directory is not empty",
      default: false,
    },
    skipPrompts: {
      type: "boolean",
      description: "Skip interactive prompts",
      default: false,
    },
    install: {
      type: "boolean",
      description: "Install dependencies after download",
      default: false,
    },
    token: {
      type: "string",
      description: "GitHub token for private repositories",
      required: false,
    },
    cache: {
      type: "boolean",
      description: "Use cached version if available",
      default: false,
    },
  },
  run: async ({ args }) => {
    const cwd = process.cwd();

    // -------------------------------
    // 1. Determine which repo to download
    // -------------------------------
    let selectedRepo = args.repo;
    if (!selectedRepo && !args.skipPrompts) {
      selectedRepo = await selectPrompt({
        title: "Select a repository to download",
        options: [
          { label: "reliverse/cli", value: "reliverse/cli" },
          { label: "reliverse/template", value: "reliverse/template" },
          { label: "Enter custom repository", value: "custom" },
        ],
      });
      if (selectedRepo === "custom") {
        selectedRepo = await inputPrompt({
          title: "Enter repository in owner/repo format",
        });
      }
    }
    if (!selectedRepo) {
      relinka("error", "No repository specified. Aborting.");
      process.exit(1);
    }

    // -------------------------------
    // 2. Determine destination directory
    // -------------------------------
    // If no destination is provided, use a default folder name
    const projectPath = args.dest
      ? path.resolve(cwd, args.dest)
      : path.resolve(cwd, "downloaded-repo");

    // Check whether the target folder exists and is nonempty
    if (await fs.pathExists(projectPath)) {
      const files = await fs.readdir(projectPath);
      if (files.length > 0 && !args.force && !args.skipPrompts) {
        const overwrite = await confirmPrompt({
          title: `Destination directory (${projectPath}) is not empty. Overwrite?`,
          defaultValue: false,
        });
        if (!overwrite) {
          relinka("error", "Aborting download due to non-empty destination.");
          process.exit(1);
        }
      }
    }

    // -------------------------------
    // 3. Call the downloader
    // -------------------------------
    try {
      const result = await handleDownload({
        cwd,
        isDev: args.dev,
        skipPrompts: args.skipPrompts,
        projectPath,
        projectName: path.basename(projectPath),
        selectedRepo,
        githubToken: args.token,
        config: undefined, // You may extend this to load a config if needed
        preserveGit: true,
        install: args.install,
        isCustom: false,
        isTemplateDownload: false,
        cache: args.cache,
      });
      relinka("success", `Repository successfully downloaded to ${result.dir}`);
    } catch (error) {
      relinka("error", "Download failed", String(error));
      process.exit(1);
    }
  },
});
