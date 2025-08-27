/**
 * USAGE EXAMPLES:
 * - dler x detect - detects the package manager
 * - dler x run script-name - runs a script
 * - dler x exec --target 'bun run build' - executes a command
 * - dler x package-name - runs a package directly (like bunx/npx)
 * - dler x package-name --args arg1 arg2 - runs a package with arguments
 * - dler x package-name --bun - force using bunx even if different PM detected
 * - dler x prettier --npm --yes - force using npx with auto-confirm
 */

import { detectPackageManager, runScript, x } from "@reliverse/dler";
import path from "@reliverse/pathkit";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "x",
    version: "1.1.0",
    description:
      "Utility command executor and package runner. Usage example: `dler x detect` or `dler x package-name` (like bunx/npx)",
  },
  args: defineArgs({
    action: {
      type: "string",
      description: "Action to perform: detect, run, exec, or package name to run directly",
      required: true,
    },
    name: {
      type: "positional",
      description: "Script name (for run action) or additional arguments",
      required: false,
    },
    cwd: {
      type: "string",
      description: "Current working directory",
    },
    silent: {
      type: "boolean",
      description: "Run in silent mode",
    },
    target: {
      type: "string",
      description: "Command to execute (for exec action)",
    },
    timeout: {
      type: "number",
      description: "Timeout in milliseconds",
    },
    throwOnError: {
      type: "boolean",
      description: "Throw error if command fails",
      default: true,
    },
    args: {
      type: "string",
      description: "Additional arguments to pass to the package (space-separated)",
    },
    global: {
      type: "boolean",
      alias: "g",
      description: "Use global package manager execution",
    },
    yes: {
      type: "boolean",
      alias: "y",
      description: "Automatically confirm package installation if needed",
    },
    bun: {
      type: "boolean",
      description: "Force using bunx (overrides package manager detection)",
    },
    npm: {
      type: "boolean",
      description: "Force using npx (overrides package manager detection)",
    },
    pnpm: {
      type: "boolean",
      description: "Force using pnpx (overrides package manager detection)",
    },
    yarn: {
      type: "boolean",
      description: "Force using yarn dlx (overrides package manager detection)",
    },
  }),
  async run({ args }) {
    // console.log("DEBUG: x command starting with args:", args);

    const {
      action,
      name,
      target,
      timeout,
      throwOnError,
      args: packageArgs,
      global,
      yes,
      bun,
      npm,
      pnpm,
      yarn,
      ...options
    } = args;

    // Check if action is one of the built-in commands
    const builtInActions = ["detect", "run", "exec"];
    const isBuiltInAction = builtInActions.includes(action);

    if (!isBuiltInAction) {
      // Treat action as a package name to run (bunx/npx style)
      await runPackage({
        packageName: action,
        packageArgs: name
          ? [name, ...(packageArgs?.split(/\s+/) || [])]
          : packageArgs?.split(/\s+/) || [],
        cwd: options.cwd,
        timeout,
        throwOnError,
        global,
        yes,
        forcePm: { bun, npm, pnpm, yarn },
      });
      return;
    }

    switch (action) {
      case "detect": {
        const cwd = path.resolve(options.cwd || ".");
        const packageManager = await detectPackageManager(cwd);

        if (packageManager?.warnings) {
          for (const warning of packageManager.warnings) {
            relinka.warn(warning);
          }
        }

        if (!packageManager) {
          relinka.error(`Cannot detect package manager in \`${cwd}\``);
          return process.exit(1);
        }

        relinka.verbose(
          `Detected package manager in \`${cwd}\`: \`${packageManager.name}@${packageManager.version}\``,
        );
        break;
      }

      case "run": {
        if (!name) {
          relinka.error("Script name is required for run action");
          return process.exit(1);
        }
        await runScript(name, options);
        break;
      }

      case "exec": {
        if (!target) {
          relinka.error("Target command is required for exec action");
          return process.exit(1);
        }

        try {
          // Parse the target command string into command and arguments
          const commandParts = target.trim().split(/\s+/);
          const command = commandParts[0];
          const commandArgs = commandParts.slice(1);

          if (!command) {
            relinka.error("No command provided");
            return process.exit(1);
          }

          relinka.verbose(`Executing: ${target}`);

          // Execute the command using the exec utility
          const result = x(command, commandArgs, {
            nodeOptions: {
              cwd: options.cwd ? path.resolve(options.cwd) : process.cwd(),
              stdio: "inherit", // This will pipe stdout/stderr to the parent process
            },
            timeout,
            throwOnError,
          });

          // Wait for the command to complete
          const output = await result;

          if (output.exitCode === 0) {
            relinka.success("Command completed successfully");
          } else {
            relinka.warn(`Command exited with code: ${output.exitCode}`);
            if (throwOnError) {
              return process.exit(output.exitCode || 1);
            }
          }
        } catch (error) {
          relinka.error(
            `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
          );
          return process.exit(1);
        }
        break;
      }

      default: {
        relinka.error(`Unknown action: ${action}`);
        relinka.verbose("Available actions: detect, run, exec, or package name to run directly");
        return process.exit(1);
      }
    }
  },
});

async function runPackage({
  packageName,
  packageArgs,
  cwd,
  timeout,
  throwOnError,
  global,
  yes,
  forcePm,
}: {
  packageName: string;
  packageArgs: string[];
  cwd?: string;
  timeout?: number;
  throwOnError: boolean;
  global?: boolean;
  yes?: boolean;
  forcePm: { bun?: boolean; npm?: boolean; pnpm?: boolean; yarn?: boolean };
}) {
  try {
    const workingDir = cwd ? path.resolve(cwd) : process.cwd();

    // Determine which package manager to use
    let pmName: string;

    // Check for forced package manager flags
    const forcedPmFlags = Object.entries(forcePm).filter(([_, isForced]) => isForced);

    if (forcedPmFlags.length > 1) {
      relinka.error(
        "Multiple package manager flags specified. Use only one: --bun, --npm, --pnpm, or --yarn",
      );
      return process.exit(1);
    }

    if (forcedPmFlags.length === 1) {
      pmName = forcedPmFlags[0]![0];
      relinka.verbose(`Forcing package manager: ${pmName}`);
    } else {
      // Auto-detect package manager
      const packageManager = await detectPackageManager(workingDir);

      if (!packageManager) {
        relinka.warn("Cannot detect package manager. Defaulting to npm.");
        pmName = "npm";
      } else {
        pmName = packageManager.name;
      }
    }

    let runCommand: string[];

    switch (pmName) {
      case "bun":
        runCommand = ["bunx"];
        break;
      case "pnpm":
        runCommand = ["pnpx", "dlx"];
        break;
      case "yarn":
        runCommand = ["yarn", "dlx"];
        break;
      case "npm":
        runCommand = ["npx"];
        break;
      default:
        runCommand = ["npx"];
        break;
    }

    // Add flags
    if (global && pmName !== "yarn") {
      runCommand.push("--global");
    }
    if (yes && (pmName === "npm" || pmName === "pnpm")) {
      runCommand.push("--yes");
    }

    // Add package name and arguments
    runCommand.push(packageName);
    runCommand.push(...packageArgs);

    relinka.verbose(`Running package: ${packageName}`);
    relinka.verbose(`Using command: ${runCommand.join(" ")}`);

    // Execute the package runner command
    const result = x(runCommand[0]!, runCommand.slice(1), {
      nodeOptions: {
        cwd: workingDir,
        stdio: "inherit",
      },
      timeout,
      throwOnError,
    });

    // Wait for the command to complete
    const output = await result;

    if (output.exitCode === 0) {
      relinka.success(`Successfully ran package: ${packageName}`);
    } else {
      relinka.warn(`Package exited with code: ${output.exitCode}`);
      if (throwOnError) {
        return process.exit(output.exitCode || 1);
      }
    }
  } catch (error) {
    relinka.error(
      `Failed to run package: ${error instanceof Error ? error.message : String(error)}`,
    );
    return process.exit(1);
  }
}
