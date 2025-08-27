// <dler-disable-agg>

/**
 * dler get # Install/upgrade dler standalone
 * dler get --dry-run # Check what would be installed
 * dler get --url sindresorhus/execa # Install from different repo
 * dler get --force --version latest # Force fresh installation
 */

import fs from "node:fs/promises";
import { homedir, platform } from "node:os";
import path from "node:path";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

import {
  checkPowerShellVersion,
  installDlerStandalone,
  installFromGitHub,
} from "./get-impl/get-core";

export default defineCommand({
  meta: {
    name: "get",
    version: "1.0.0",
    description:
      "Download and install GitHub release binaries. Installs dler standalone by default.",
  },
  args: defineArgs({
    url: {
      type: "string",
      description: "GitHub repository URL (owner/repo format) to download from",
    },
    version: {
      type: "string",
      description: "Specific version to download (defaults to latest)",
      default: "latest",
    },
    binary: {
      type: "string",
      description: "Specific binary name to download (auto-detected if not provided)",
    },
    force: {
      type: "boolean",
      description: "Force reinstallation even if already installed",
      default: false,
    },
    "dry-run": {
      type: "boolean",
      description: "Show what would be downloaded without installing",
      default: false,
    },
    "skip-path": {
      type: "boolean",
      description: "Skip adding to PATH",
      default: false,
    },
  }),
  async run({ args }) {
    try {
      // Check PowerShell version on Windows before proceeding
      if (platform() === "win32") {
        await checkPowerShellVersion();
      }

      const installDir = path.resolve(homedir(), ".reliverse", "dler");
      const appsPath = path.resolve(homedir(), ".reliverse", "apps.json");

      // Ensure install directory exists
      await fs.mkdir(installDir, { recursive: true });

      if (!args.url) {
        // Default: Install dler standalone binary
        await installDlerStandalone(installDir, appsPath, args);
      } else {
        // Install from specified GitHub repo
        await installFromGitHub(args.url, installDir, appsPath, args);
      }
    } catch (error) {
      relinka(
        "error",
        `Installation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  },
});
