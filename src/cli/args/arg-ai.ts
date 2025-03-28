import { defineCommand } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

import type { AiSdkAgent } from "~/libs/sdk/ai/ai-impl/ai-types.js";

import { ensureOpenAIKey } from "~/libs/sdk/ai/ai-impl/ai-auth.js";
import { AGENT_NAMES } from "~/libs/sdk/ai/ai-impl/ai-const.js";
import { aiAgenticTool } from "~/libs/sdk/ai/ai-impl/ai-tools.js";
import { aiMenu } from "~/libs/sdk/ai/ai-menu.js";
import { getReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

export default defineCommand({
  meta: {
    name: "ai",
    description: "Chat with Reliverse AI or use Reliverse Agents",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run the CLI in dev mode",
    },
    generate: {
      type: "string",
      description: "Generate a new project",
    },
    agent: {
      type: "string",
      description: "Select a Reliverse Agent",
    },
    target: {
      type: "string",
      description: "Path to the file or directory (skips Relinter's prompt)",
    },
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    if (isDev) {
      relinka("log-verbose", "Using dev mode");
    }

    const cwd = getCurrentWorkingDirectory();
    const { config } = await getReliverseConfig(cwd, isDev, {});
    const memory = await getReliverseMemory();
    await ensureOpenAIKey(memory);

    const agent = args.agent as AiSdkAgent | undefined;
    if (agent !== undefined) {
      if (!AGENT_NAMES.includes(agent)) {
        throw new Error(
          `Invalid agent specified. Valid agents: ${AGENT_NAMES.join(", ")}`,
        );
      }
      await aiAgenticTool({
        config,
        agent,
        isKeyEnsured: true,
        target: args.target,
      });
      process.exit(0);
    }

    await aiMenu(config, true);

    process.exit(0);
  },
});
