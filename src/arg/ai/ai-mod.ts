import { defineCommand } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

import { getReliverseConfig } from "~/utils/reliverseConfig/rc-mod.js";
import { getReliverseMemory } from "~/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/utils/terminalHelpers.js";

import { aiAgent } from "./ai-agent.js";
import { AGENT_NAMES } from "./ai-const.js";
import { ensureOpenAIKey } from "./ai-key.js";
import { aiMenu } from "./ai-menu.js";
import { type Agent } from "./ai-types.js";

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

    const agent = args.agent as Agent | undefined;
    if (agent !== undefined) {
      if (!AGENT_NAMES.includes(agent)) {
        throw new Error(
          `Invalid agent specified. Valid agents: ${AGENT_NAMES.join(", ")}`,
        );
      }
      await aiAgent({
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
