import { defineCommand } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

import { getReliverseMemory } from "~/utils/reliverseMemory.js";

import { aiAgent } from "./ai-agent.js";
import { ensureOpenAIKey } from "./ai-key.js";
import { aiMenu } from "./ai-menu.js";
import { AGENTS, type Agent } from "./ai-types.js";

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
    if (args.dev) {
      relinka("log-verbose", "Using dev mode");
    }

    const memory = await getReliverseMemory();
    await ensureOpenAIKey(memory);

    const agent = args.agent as Agent | undefined;
    if (agent !== undefined) {
      if (!AGENTS.includes(agent)) {
        throw new Error("Invalid agent specified.");
      }
      await aiAgent({
        agent,
        isKeyEnsured: true,
        target: args.target,
      });
      process.exit(0);
    }

    await aiMenu(true);

    process.exit(0);
  },
});
