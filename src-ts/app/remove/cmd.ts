/**
 * USAGE EXAMPLES:
 * - dler remove package-name - removes a package
 * - dler rm package-name - removes a package (alias)
 * - dler uninstall package-name - removes a package (alias)
 * - dler remove --standalone - removes standalone dler installation
 */

import { homedir, platform } from "node:os";
import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";
import { execa } from "execa";
import { lookpath } from "lookpath";

import { removeDependency } from "~/app/utils/pm/pm-api";
import { isCatalogSupported, removeFromCatalog } from "~/app/utils/pm/pm-catalog";
import { detectPackageManager } from "~/app/utils/pm/pm-detect";

interface MetaInfo {
  version: string;
  downloadUrl: string;
  installedAt: string;
  binary: string;
  repository?: string;
}

export default defineCommand({
  meta: {
    name: "remove",
    version: "1.1.0",
    description: "Remove dependencies. Usage example: `dler remove package-name`",
  },
  args: defineArgs({
    action: {
      type: "string",
      description: "Action to perform: remove, rm, uninstall, un, delete, del",
      required: false,
      default: "remove",
    },
    name: {
      type: "positional",
      description: "Package name",
      required: true,
    },
    global: {
      type: "boolean",
      alias: "g",
      description: "Remove globally",
    },
    cwd: {
      type: "string",
      description: "Current working directory",
    },
    workspace: {
      type: "boolean",
      description: "Remove from workspace",
    },
    silent: {
      type: "boolean",
      description: "Run in silent mode",
    },
    linter: {
      type: "boolean",
      description: "Run linter checks after removing dependencies",
      default: false,
    },
    filter: {
      type: "array",
      description: "Filter workspaces to operate on (e.g., 'pkg-*', '!pkg-c', './packages/pkg-*')",
    },
    "from-catalog": {
      type: "string",
      description: "Remove dependencies from catalog (e.g., 'default', 'testing', 'build')",
    },
    "catalog-name": {
      type: "string",
      description: "Name of the catalog to remove dependencies from (used with --from-catalog)",
    },
    standalone: {
      type: "boolean",
      description: "Remove standalone dler installation",
      default: false,
    },
  }),
  async run({ args }) {
    // console.log("DEBUG: remove command starting with args:", args);

    const {
      action,
      name,
      linter,
      standalone,
      filter,
      "from-catalog": fromCatalog,
      "catalog-name": catalogName,
      ...options
    } = args;

    // Handle workspace filtering
    if (filter && filter.length > 0) {
      const packageManager = await detectPackageManager(process.cwd());
      if (packageManager) {
        // Add filter arguments to the options
        (options as any).filter = filter;
      }
    }

    // Handle catalog removal operations
    if (fromCatalog && name) {
      const packageManager = await detectPackageManager(process.cwd());
      if (!packageManager) {
        relinka("error", "Could not detect package manager");
        return process.exit(1);
      }

      if (!isCatalogSupported(packageManager)) {
        relinka(
          "error",
          `Catalogs are not supported by ${packageManager.name}. Only Bun supports catalogs.`,
        );
        return process.exit(1);
      }

      const dependencies = Array.isArray(name) ? (name as string[]) : [name as string];
      const catalogType = fromCatalog === "default" ? "catalog" : "catalogs";
      const actualCatalogName = fromCatalog === "default" ? undefined : catalogName || fromCatalog;

      await removeFromCatalog(dependencies, catalogType, actualCatalogName, options.cwd);
      return;
    }

    // Handle standalone dler removal
    if (standalone) {
      await removeStandaloneDler();
      return;
    }

    if (!name) {
      relinka.error("Package name is required for remove action");
      return process.exit(1);
    }

    switch (action) {
      case "remove":
      case "rm":
      case "uninstall":
      case "un":
      case "delete":
      case "del":
        await removeDependency(name, options);
        break;

      default: {
        // If no specific action is provided, default to remove behavior
        if (!action || action === "remove") {
          await removeDependency(name, options);
        } else {
          relinka.error(`Unknown action: ${action}`);
          relinka.verbose("Available actions: remove, rm, uninstall, un, delete, del");
          return process.exit(1);
        }
      }
    }
  },
});

async function removeStandaloneDler(): Promise<void> {
  try {
    relinka("info", "Removing standalone dler installation...");

    const installDir = path.resolve(homedir(), ".reliverse", "dler");
    const appsPath = path.resolve(homedir(), ".reliverse", "apps.json");

    // Get current meta to check if dler is installed
    const currentMeta = await getCurrentAppsJson(appsPath, "dler");
    if (!currentMeta) {
      relinka("warn", "Standalone dler installation not found");
      return;
    }

    const binaryInfo = getDlerBinaryInfo();
    const binaryPath = path.resolve(installDir, binaryInfo.localName);

    // Remove binary file
    if (await fs.pathExists(binaryPath)) {
      await fs.remove(binaryPath);
      relinka("success", `Removed binary: ${binaryPath}`);
    }

    // Remove from PATH
    await removeFromPath(installDir);

    // Update apps.json
    await removeFromAppsJson(appsPath, "dler");

    relinka("success", "Standalone dler installation removed successfully");
    relinka("info", "Please restart your terminal for PATH changes to take effect");
  } catch (error) {
    relinka(
      "error",
      `Failed to remove standalone dler: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

function getDlerBinaryInfo() {
  const os = platform();

  if (os === "darwin") {
    return {
      filename: "dler-darwin-arm64",
      localName: "dler",
    };
  } else if (os === "linux") {
    return {
      filename: "dler-linux",
      localName: "dler",
    };
  } else if (os === "win32") {
    return {
      filename: "dler-windows.exe",
      localName: "dler.exe",
    };
  } else {
    throw new Error(`Unsupported platform: ${os}`);
  }
}

async function getCurrentAppsJson(appsPath: string, binaryKey: string): Promise<MetaInfo | null> {
  try {
    if (await fs.pathExists(appsPath)) {
      const content = await fs.readFile(appsPath, "utf8");
      const allMeta = JSON.parse(content) as Record<string, MetaInfo>;
      return allMeta[binaryKey] || null;
    }
  } catch {
    // Ignore errors, treat as not installed
  }
  return null;
}

async function removeFromAppsJson(appsPath: string, binaryKey: string): Promise<void> {
  try {
    if (await fs.pathExists(appsPath)) {
      const content = await fs.readFile(appsPath, "utf8");
      const allMeta = JSON.parse(content) as Record<string, MetaInfo>;

      // Remove the specific binary's meta
      delete allMeta[binaryKey];

      // Write back to file (or remove file if empty)
      if (Object.keys(allMeta).length === 0) {
        await fs.remove(appsPath);
        relinka("info", "Removed empty apps.json file");
      } else {
        await fs.writeFile(appsPath, JSON.stringify(allMeta, null, 2), "utf8");
        relinka("info", "Updated apps.json file");
      }
    }
  } catch (error) {
    relinka("warn", `Could not update apps.json: ${error}`);
  }
}

async function removeFromPath(installDir: string): Promise<void> {
  const os = platform();

  if (os === "win32") {
    // Try to remove from PATH automatically using PowerShell
    try {
      await removeFromWindowsPath(installDir);
      relinka("success", `Removed ${installDir} from PATH`);
    } catch (error) {
      relinka("warn", `Failed to automatically remove from PATH: ${error}`);
      relinka("info", `Please manually remove ${installDir} from your PATH environment variable`);
    }
  } else {
    // Unix-like systems
    const homeDir = homedir();
    const shellRc =
      os === "darwin" ? path.resolve(homeDir, ".zshrc") : path.resolve(homeDir, ".bashrc");

    try {
      if (await fs.pathExists(shellRc)) {
        let rcContent = await fs.readFile(shellRc, "utf8");

        // Remove the PATH export line
        const pathExport = `export PATH="${installDir}:$PATH"`;
        const commentLine = "# Added by dler get command";

        // Remove both the comment and the export line
        rcContent = rcContent
          .replace(
            new RegExp(
              `\n${commentLine}\n${pathExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\n`,
              "g",
            ),
            "\n",
          )
          .replace(
            new RegExp(
              `${commentLine}\n${pathExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\n?`,
              "g",
            ),
            "",
          )
          .replace(new RegExp(`\n?${pathExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"), "");

        await fs.writeFile(shellRc, rcContent, "utf8");
        relinka("success", `Removed from PATH in ${shellRc}`);
        relinka("info", "Please restart your terminal or run: source " + shellRc);
      }
    } catch (error) {
      relinka("warn", `Could not modify shell RC file: ${error}`);
      relinka("info", `Please manually remove ${installDir} from your PATH`);
    }
  }
}

async function removeFromWindowsPath(installDir: string): Promise<void> {
  // PowerShell script to remove directory from user PATH
  const psScript = `
    function Refresh-Path {
      $paths = @(
        [System.Environment]::GetEnvironmentVariable("Path", "Machine"),
        [System.Environment]::GetEnvironmentVariable("Path", "User"),
        [System.Environment]::GetEnvironmentVariable("Path", "Process")
      )
      $uniquePaths = $paths |
        Where-Object { $_ } |
        ForEach-Object { $_.Split(';', [StringSplitOptions]::RemoveEmptyEntries) } |
        Where-Object { $_ -and (Test-Path $_) } |
        Select-Object -Unique
      $env:Path = ($uniquePaths -join ';').TrimEnd(';')
    }

    function Remove-From-User-Path {
      param([string]$Directory)
      
      $absolutePath = Resolve-Path $Directory -ErrorAction SilentlyContinue
      if (-not $absolutePath) {
        $absolutePath = $Directory
      }
      
      $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
      if (-not $currentPath) { 
        Write-Host "No User PATH found"
        return
      }
      
      # Split PATH and remove the target directory
      $pathArray = $currentPath.Split(';', [StringSplitOptions]::RemoveEmptyEntries)
      $filteredPaths = $pathArray | Where-Object { $_ -ne $absolutePath }
      
      if ($pathArray.Count -eq $filteredPaths.Count) {
        Write-Host "Directory not found in PATH"
        return
      }
      
      $newPath = $filteredPaths -join ';'
      
      Write-Host "Removing $absolutePath from User PATH..."
      [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
      Refresh-Path
      Write-Host "PATH updated successfully"
    }

    Remove-From-User-Path '${installDir.replace(/\\/g, "\\\\").replace(/'/g, "''")}' 
  `.trim();

  // Find PowerShell executable (prefer pwsh over powershell)
  const pwshPath = await lookpath("pwsh");
  const powershellCmd = pwshPath || "powershell";

  // Execute PowerShell command
  await execa(powershellCmd, ["-Command", psScript]);
}
