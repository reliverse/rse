/**
 * # Single command
 * rse invoke --command ai --args --agent relinter --target ./src
 *
 * # Chain execution
 * rse invoke --chain setup-auth
 *
 * # Interactive mode
 * rse invoke --interactive
 *
 * # Dry run
 * rse invoke --chain new-project --dryRun
 *
 * # Help
 * rse invoke
 */

import { getOrCreateRseConfig } from "@reliverse/cfg";
import { relinka } from "@reliverse/relinka";
import {
  defineCommand,
  confirmPrompt,
  selectPrompt,
  inputPrompt,
} from "@reliverse/rempts";
import { execaCommand } from "execa";

import { getOrCreateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers";

interface InvokeOptions {
  command: string;
  args?: string[];
  allowDangerous?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

interface InvokeChain {
  steps: InvokeOptions[];
  name: string;
  description?: string;
}

// Security: Commands that should be restricted in certain modes
const DANGEROUS_COMMANDS = [
  "login",
  "logout",
  "memory",
  "schema",
  "studio",
  "update",
  "upload",
];

// Commands that can be safely invoked by AI/automation
const SAFE_COMMANDS = [
  "add",
  "ai",
  "better/auth",
  "clone",
  "cmod",
  "env",
  "help",
  "init",
  "toolbox",
  "mrse",
];

// Predefined command chains for common workflows
const PREDEFINED_CHAINS: Record<string, InvokeChain> = {
  "setup-auth": {
    name: "Setup Authentication",
    description: "Initialize a complete auth setup with Better Auth",
    steps: [
      { command: "better", args: ["auth", "init"] },
      { command: "better", args: ["auth", "generate"] },
      { command: "env" },
    ],
  },
  "new-project": {
    name: "New Project Setup",
    description: "Create and setup a new project with dependencies",
    steps: [{ command: "init" }, { command: "add" }, { command: "env" }],
  },
  "code-quality": {
    name: "Code Quality Check",
    description: "Run linting and code improvements",
    steps: [
      { command: "ai", args: ["--agent", "relinter"] },
      { command: "cmod" },
    ],
  },
};

export default defineCommand({
  meta: {
    name: "invoke",
    description:
      "Invoke RSE CLI commands programmatically for AI agents and automation",
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
    const { config } = await getOrCreateRseConfig({
      projectPath: cwd,
      isDev,
      overrides: {},
    });
    const _memory = await getOrCreateReliverseMemory();

    // Check if self-invocation is allowed in config (stored in customRules)
    const allowSelfInvocation =
      config.customRules?.allowSelfInvocation === true;
    if (!allowSelfInvocation && !isDev) {
      relinka(
        "error",
        "Self-invocation is disabled. Enable it in .config/rse.ts with 'customRules: { allowSelfInvocation: true }'",
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
        await interactiveMode({ allowDangerous, dryRun, verbose, isDev });
      } else {
        await showInvokeHelp();
      }
    } catch (error) {
      relinka(
        "error",
        "Invoke failed:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  },
});

async function invokeSingleCommand(
  options: InvokeOptions,
  isDev: boolean,
): Promise<void> {
  const { command, args = [], allowDangerous, dryRun, verbose } = options;

  // Security check
  if (DANGEROUS_COMMANDS.includes(command) && !allowDangerous) {
    relinka(
      "error",
      `Command '${command}' is restricted. Use --allowDangerous to override.`,
    );
    return;
  }

  // Build the full command
  const fullCommand = isDev ? `bun dev:${command}` : `rse ${command}`;
  const fullArgs = args.length > 0 ? ` ${args.join(" ")}` : "";
  const execCommand = `${fullCommand}${fullArgs}`;

  if (verbose || dryRun) {
    relinka("info", `${dryRun ? "[DRY RUN] " : ""}Executing: ${execCommand}`);
  }

  if (dryRun) {
    return;
  }

  try {
    await execaCommand(execCommand, { stdio: "inherit" });
    if (verbose) {
      relinka("success", `Command '${command}' completed successfully`);
    }
  } catch (error) {
    throw new Error(
      `Failed to execute '${command}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function executeChain(
  chainName: string,
  options: {
    dryRun: boolean;
    allowDangerous: boolean;
    verbose: boolean;
    isDev: boolean;
  },
): Promise<void> {
  const chain = PREDEFINED_CHAINS[chainName];
  if (!chain) {
    relinka(
      "error",
      `Unknown chain '${chainName}'. Available chains: ${Object.keys(PREDEFINED_CHAINS).join(", ")}`,
    );
    return;
  }

  relinka("info", `Executing chain: ${chain.name}`);
  if (chain.description) {
    relinka("info", chain.description);
  }

  if (options.dryRun) {
    relinka("info", "[DRY RUN] Chain steps:");
    for (const step of chain.steps) {
      const cmd = options.isDev
        ? `bun dev:${step.command}`
        : `rse ${step.command}`;
      const args = step.args ? ` ${step.args.join(" ")}` : "";
      relinka("info", `  ${cmd}${args}`);
    }
    return;
  }

  for (let i = 0; i < chain.steps.length; i++) {
    const step = chain.steps[i];
    if (!step) continue;

    relinka("info", `Step ${i + 1}/${chain.steps.length}: ${step.command}`);

    try {
      await invokeSingleCommand(
        {
          command: step.command,
          args: step.args,
          allowDangerous: options.allowDangerous,
          dryRun: false,
          verbose: options.verbose,
        },
        options.isDev,
      );
    } catch (error) {
      relinka(
        "error",
        `Chain failed at step ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
      );

      const shouldContinue = await confirmPrompt({
        title: "Continue with remaining steps?",
        defaultValue: false,
      });

      if (!shouldContinue) {
        process.exit(1);
      }
    }
  }

  relinka("success", `Chain '${chainName}' completed`);
}

async function interactiveMode(options: {
  allowDangerous: boolean;
  dryRun: boolean;
  verbose: boolean;
  isDev: boolean;
}): Promise<void> {
  const mode = await selectPrompt({
    title: "RSE Invoke - Interactive Mode",
    options: [
      { label: "Execute single command", value: "single" },
      { label: "Execute predefined chain", value: "chain" },
      { label: "Create custom chain", value: "custom" },
      { label: "Show available commands", value: "help" },
      { label: "Exit", value: "exit" },
    ],
  });

  switch (mode) {
    case "single":
      await interactiveSingleCommand(options);
      break;
    case "chain":
      await interactiveChainSelection(options);
      break;
    case "custom":
      await interactiveCustomChain(options);
      break;
    case "help":
      await showInvokeHelp();
      break;
    case "exit":
      process.exit(0);
  }
}

async function interactiveSingleCommand(options: {
  allowDangerous: boolean;
  dryRun: boolean;
  verbose: boolean;
  isDev: boolean;
}): Promise<void> {
  const availableCommands = options.allowDangerous
    ? [...SAFE_COMMANDS, ...DANGEROUS_COMMANDS]
    : SAFE_COMMANDS;

  const command = await selectPrompt({
    title: "Select command to invoke",
    options: availableCommands.map((cmd) => ({ label: cmd, value: cmd })),
  });

  const argsInput = await inputPrompt({
    title: "Command arguments (optional)",
    content: "Enter space-separated arguments, or press Enter for none",
  });

  const args = argsInput.trim() ? argsInput.split(/\s+/) : [];

  await invokeSingleCommand(
    {
      command,
      args,
      allowDangerous: options.allowDangerous,
      dryRun: options.dryRun,
      verbose: options.verbose,
    },
    options.isDev,
  );
}

async function interactiveChainSelection(options: {
  allowDangerous: boolean;
  dryRun: boolean;
  verbose: boolean;
  isDev: boolean;
}): Promise<void> {
  const chainOptions = Object.entries(PREDEFINED_CHAINS).map(
    ([key, chain]) => ({
      label: `${chain.name} - ${chain.description || "No description"}`,
      value: key,
    }),
  );

  const selectedChain = await selectPrompt({
    title: "Select predefined chain",
    options: chainOptions,
  });

  await executeChain(selectedChain, options);
}

async function interactiveCustomChain(options: {
  allowDangerous: boolean;
  dryRun: boolean;
  verbose: boolean;
  isDev: boolean;
}): Promise<void> {
  relinka("info", "Custom chain creation");
  const steps: InvokeOptions[] = [];

  while (true) {
    const shouldAddStep = await confirmPrompt({
      title:
        steps.length === 0
          ? "Add first command to chain?"
          : "Add another command to chain?",
      defaultValue: true,
    });

    if (!shouldAddStep) {
      break;
    }

    const availableCommands = options.allowDangerous
      ? [...SAFE_COMMANDS, ...DANGEROUS_COMMANDS]
      : SAFE_COMMANDS;

    const command = await selectPrompt({
      title: `Select command ${steps.length + 1}`,
      options: availableCommands.map((cmd) => ({ label: cmd, value: cmd })),
    });

    const argsInput = await inputPrompt({
      title: "Command arguments (optional)",
      content: "Enter space-separated arguments, or press Enter for none",
    });

    const args = argsInput.trim() ? argsInput.split(/\s+/) : [];
    steps.push({ command, args });
  }

  if (steps.length === 0) {
    relinka("info", "No commands added to chain");
    return;
  }

  // Execute the custom chain
  relinka("info", "Executing custom chain...");
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;

    relinka("info", `Step ${i + 1}/${steps.length}: ${step.command}`);

    try {
      await invokeSingleCommand(step, options.isDev);
    } catch (error) {
      relinka(
        "error",
        `Custom chain failed at step ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
      );

      const shouldContinue = await confirmPrompt({
        title: "Continue with remaining steps?",
        defaultValue: false,
      });

      if (!shouldContinue) {
        break;
      }
    }
  }

  relinka("success", "Custom chain completed");
}

async function showInvokeHelp(): Promise<void> {
  relinka("info", "RSE Invoke - Command Automation System");
  relinka("info", "");
  relinka("info", "Usage:");
  relinka("info", "  rse invoke --command <cmd> [--args arg1 arg2...]");
  relinka("info", "  rse invoke --chain <chain-name>");
  relinka("info", "  rse invoke --interactive");
  relinka("info", "");
  relinka("info", "Examples:");
  relinka("info", "  rse invoke --command add");
  relinka(
    "info",
    "  rse invoke --command ai --args --agent relinter --target ./src",
  );
  relinka("info", "  rse invoke --chain setup-auth");
  relinka("info", "  rse invoke --interactive");
  relinka("info", "");
  relinka("info", "Available predefined chains:");
  for (const [key, chain] of Object.entries(PREDEFINED_CHAINS)) {
    relinka("info", `  ${key}: ${chain.description || chain.name}`);
  }
  relinka("info", "");
  relinka("info", "Safe commands:", SAFE_COMMANDS.join(", "));
  relinka(
    "info",
    "Restricted commands (need --allowDangerous):",
    DANGEROUS_COMMANDS.join(", "),
  );
  relinka("info", "");
  relinka("info", "Security:");
  relinka(
    "info",
    "  Enable self-invocation in .config/rse.ts: allowSelfInvocation: true",
  );
  relinka("info", "  Use --allowDangerous flag for restricted commands");
  relinka("info", "  Use --dryRun to preview commands without execution");
}
