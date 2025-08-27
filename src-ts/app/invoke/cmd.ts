import { relinka } from "@reliverse/relinka";
import { confirmPrompt, defineCommand, inputPrompt, selectPrompt } from "@reliverse/rempts";
import { execaCommand } from "execa";
import { getOrCreateReliverseConfig } from "~/app/config/core-cfg";

import { getCurrentWorkingDirectory } from "~/app/utils/terminalHelpers";

export default defineCommand({
  meta: {
    name: "invoke",
    description: "Invoke RSE CLI commands programmatically for AI agents and automation",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run in development mode",
      default: false,
    },
    command: {
      type: "string",
      description: "RSE command to invoke (e.g., 'add', 'ai', 'init')",
      required: false,
    },
    args: {
      type: "array",
      description: "Arguments to pass to the invoked command",
      required: false,
    },
    chain: {
      type: "string",
      description: "Execute a predefined command chain",
      required: false,
    },
    dryRun: {
      type: "boolean",
      description: "Show what would be executed without running commands",
      default: false,
    },
    allowDangerous: {
      type: "boolean",
      description: "Allow execution of potentially dangerous commands",
      default: false,
    },
    verbose: {
      type: "boolean",
      description: "Show detailed execution information",
      default: false,
    },
    interactive: {
      type: "boolean",
      description: "Use interactive mode for command selection",
      default: false,
    },
  },
  async run({ args }) {
    const {
      dev: isDev,
      command,
      args: cmdArgs,
      chain,
      dryRun,
      allowDangerous,
      verbose,
      interactive,
    } = args;

    const cwd = getCurrentWorkingDirectory();
    const { config } = await getOrCreateReliverseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });

    // Check if self-invocation is allowed in config (stored in customRules)
    const allowSelfInvocation = config.customRules?.allowSelfInvocation === true;
    if (!allowSelfInvocation && !isDev) {
      relinka(
        "error",
        "Self-invocation is disabled. Enable it in reliverse.ts with 'customRules: { allowSelfInvocation: true }'",
      );
      process.exit(1);
    }

    try {
      if (chain) {
        await executeChain(chain, { dryRun, allowDangerous, verbose, isDev });
      } else if (command) {
        await invokeSingleCommand(
          {
            command,
            args: cmdArgs || [],
            allowDangerous,
            dryRun,
            verbose,
          },
          isDev,
        );
      } else if (interactive) {
        await globalInstallInteractiveMode({ allowDangerous, dryRun, verbose, isDev });
      } else {
        await showInvokeHelp();
      }
    } catch (error) {
      relinka("error", "Invoke failed:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  },
});
